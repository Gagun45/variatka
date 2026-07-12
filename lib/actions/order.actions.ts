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
          const stockUpdate = await tx.recipe.updateMany({
            where: {
              id: item.recipeId,
              inStock: { gte: item.amount },
            },
            data: {
              inStock: { decrement: item.amount },
            },
          });

          if (stockUpdate.count === 0) {
            throw new AppError(
              `"${item.recipeTitle}" has only ${item.recipe.inStock} items left in stock.`,
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

    // Prevent invalid amounts
    if (orderItems.some((item) => item.amount <= 0)) {
      throw new AppError("Invalid item quantity.");
    }

    const recipeIds = orderItems.map((item) => item.id);
    if (new Set(recipeIds).size !== recipeIds.length) {
      throw new AppError("Each product may only appear once in an order.");
    }

    const order = await prisma.$transaction(async (tx) => {
      // Load recipes inside the transaction
      const recipes = await tx.recipe.findMany({
        where: {
          ...publicRecipeWhere,
          id: {
            in: recipeIds,
          },
        },
      });

      if (recipes.length !== orderItems.length) {
        throw new AppError("Some products were not found.");
      }

      const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));

      // Create order
      return tx.order.create({
        data: {
          userId: user.pid,

          customerEmail: formValues.customerEmail,
          customerName: formValues.customerName,
          customerPhone: formValues.customerPhone,
          customerComment: formValues.customerComment,

          items: {
            create: orderItems.map((item) => {
              const recipe = recipeMap.get(item.id)!;

              return {
                recipeId: recipe.id,
                recipeTitle: recipe.title,
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
