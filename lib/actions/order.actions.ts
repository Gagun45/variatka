"use server";

import { AppError } from "../error";
import { orderPresenter } from "../presenters/order.presenter";
import { prisma } from "../prisma";
import { orderArgs, publicRecipeWhere } from "../prisma.args";
import { IActionResponse } from "../types";
import {
  ICreateOrderDto,
  IPublicOrder,
  IUpdateOrderStatusDto,
} from "../types.order";
import { safeAction } from "./action.wrapper";
import { getCurrentUser, requireAdmin } from "./user.actions";

export const getAllOrders = async (): Promise<
  IActionResponse<IPublicOrder[]>
> => {
  return safeAction("getAllOrders", async () => {
    await requireAdmin();

    const orders = await prisma.order.findMany({
      orderBy: [{ createdAt: "desc" }],
      ...orderArgs,
    });

    return orders.map(orderPresenter.toPublic);
  });
};

export const updateOrderStatus = async ({
  id,
  status,
}: IUpdateOrderStatusDto): Promise<IActionResponse<IPublicOrder>> => {
  return safeAction("updateOrderStatus", async () => {
    await requireAdmin();

    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id },
        ...orderArgs,
      });

      if (!existingOrder) throw new AppError("Order not found.");

      if (existingOrder.status !== "PROCESSING") {
        throw new AppError(
          `${existingOrder.status === "COMPLETED" ? "Completed" : "Cancelled"} orders cannot be changed.`,
        );
      }

      if (status === "PROCESSING") {
        throw new AppError("Order is already processing.");
      }

      // Claim the transition before changing stock. A concurrent request will
      // update zero rows and cannot decrement the same order twice.
      const transition = await tx.order.updateMany({
        where: { id, status: "PROCESSING" },
        data: { status },
      });

      if (transition.count === 0) {
        throw new AppError("Order status has already been changed.");
      }

      if (status === "COMPLETED") {
        for (const item of existingOrder.items) {
          const stockUpdate = await tx.recipeVariant.updateMany({
            where: {
              id: item.variantId,
              recipeId: item.recipeId,
              inStock: { gte: item.amount },
            },
            data: {
              inStock: { decrement: item.amount },
            },
          });

          if (stockUpdate.count === 0) {
            const currentVariant = await tx.recipeVariant.findUnique({
              where: { id: item.variantId },
              select: { inStock: true },
            });
            throw new AppError(
              `"${item.recipeTitle}" (${item.variantLabel}) has only ${currentVariant?.inStock ?? 0} items left in stock.`,
            );
          }
        }
      }

      return tx.order.findUniqueOrThrow({
        where: { id },
        ...orderArgs,
      });
    });

    return orderPresenter.toPublic(order);
  });
};

export const getMyOrders = async (): Promise<
  IActionResponse<IPublicOrder[]>
> => {
  return safeAction("getMyOrders", async () => {
    const user = await getCurrentUser();
    const orders = await prisma.order.findMany({
      where: {
        userId: user.pid,
      },
      orderBy: [{ createdAt: "desc" }],
      ...orderArgs,
    });
    const publicOrders = orders.map(orderPresenter.toPublic);
    return publicOrders;
  });
};

export const createOrder = async ({
  formValues,
  orderItems,
}: ICreateOrderDto): Promise<IActionResponse<IPublicOrder>> => {
  return safeAction("createOrder", async () => {
    const user = await getCurrentUser();

    if (orderItems.length === 0) {
      throw new AppError("Ваш кошик порожній.");
    }

    if (
      orderItems.some(
        (item) =>
          !Number.isSafeInteger(item.recipeId) ||
          item.recipeId <= 0 ||
          !Number.isSafeInteger(item.variantId) ||
          item.variantId <= 0 ||
          !Number.isSafeInteger(item.amount) ||
          item.amount <= 0,
      )
    ) {
      throw new AppError("Invalid item quantity.");
    }

    const variantIds = orderItems.map((item) => item.variantId);
    if (new Set(variantIds).size !== variantIds.length) {
      throw new AppError("Each product variant may only appear once in an order.");
    }

    const order = await prisma.$transaction(async (tx) => {
      const variants = await tx.recipeVariant.findMany({
        where: {
          id: {
            in: variantIds,
          },
          recipe: publicRecipeWhere,
        },
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (variants.length !== orderItems.length) {
        throw new AppError("Some products were not found.");
      }

      const variantMap = new Map(
        variants.map((variant) => [variant.id, variant]),
      );

      for (const item of orderItems) {
        const variant = variantMap.get(item.variantId);
        if (!variant || variant.recipeId !== item.recipeId) {
          throw new AppError("Some products were not found.");
        }
        if (variant.inStock < item.amount) {
          throw new AppError(
            `"${variant.recipe.title}" (${variant.label}) has only ${variant.inStock} items left in stock.`,
          );
        }
      }

      return tx.order.create({
        data: {
          userId: user.pid,

          customerEmail: formValues.customerEmail,
          customerName: formValues.customerName,
          customerPhone: formValues.customerPhone,
          customerComment: formValues.customerComment,

          items: {
            create: orderItems.map((item) => {
              const variant = variantMap.get(item.variantId)!;

              return {
                recipeId: variant.recipeId,
                variantId: variant.id,
                recipeTitle: variant.recipe.title,
                variantLabel: variant.label,
                amount: item.amount,
              };
            }),
          },
        },
        ...orderArgs,
      });
    });

    const publicOrder = orderPresenter.toPublic(order);
    return publicOrder;
  });
};
