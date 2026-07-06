"use server";

import { AppError } from "../error";
import { orderPresenter } from "../presenters/order.presenter";
import { prisma } from "../prisma";
import { orderArgs } from "../prisma.args";
import { IActionResponse } from "../types";
import { ICreateOrderDto, IPublicOrder } from "../types.order";
import { ACTION_ERROR } from "./action.unwrapper";
import { getCurrentUser } from "./user.actions";

export const getMyOrders = async (): Promise<
  IActionResponse<IPublicOrder[]>
> => {
  try {
    const user = await getCurrentUser();
    const orders = await prisma.order.findMany({
      where: {
        userId: user.pid,
      },
      ...orderArgs,
    });
    const publicOrders = orders.map(orderPresenter.toPublic);
    return {
      ok: true,
      data: publicOrders,
    };
  } catch (e) {
    console.error("Error in getMyOrders:", e);
    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }
    return ACTION_ERROR();
  }
};

export const createOrder = async ({
  formValues,
  orderItems,
}: ICreateOrderDto): Promise<IActionResponse<IPublicOrder>> => {
  try {
    const user = await getCurrentUser();

    if (orderItems.length === 0) {
      throw new AppError("Your cart is empty.");
    }

    // Prevent invalid amounts
    if (orderItems.some((item) => item.amount <= 0)) {
      throw new AppError("Invalid item quantity.");
    }

    const order = await prisma.$transaction(async (tx) => {
      // Load recipes inside the transaction
      const recipes = await tx.recipe.findMany({
        where: {
          id: {
            in: orderItems.map((item) => item.id),
          },
        },
      });

      if (recipes.length !== orderItems.length) {
        throw new AppError("Some products were not found.");
      }

      const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));

      // Atomically reserve stock
      for (const item of orderItems) {
        const recipe = recipeMap.get(item.id)!;

        const result = await tx.recipe.updateMany({
          where: {
            id: item.id,
            inStock: {
              gte: item.amount,
            },
          },
          data: {
            inStock: {
              decrement: item.amount,
            },
          },
        });

        if (result.count === 0) {
          throw new AppError(
            `"${recipe.title}" has only ${recipe.inStock} items left in stock.`,
          );
        }
      }

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

    return {
      ok: true,
      data: publicOrder,
    };
  } catch (e) {
    console.error("Error in createOrder:", e);

    if (e instanceof AppError) {
      return ACTION_ERROR(e.message);
    }

    return ACTION_ERROR();
  }
};
