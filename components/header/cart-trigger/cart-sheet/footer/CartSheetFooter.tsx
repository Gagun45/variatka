"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SheetFooter } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { selectCartTotalQuantity, useCartStore } from "@/zustand/cart.store";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { signIn } from "next-auth/react";

interface Props {
  closeSheet: () => void;
}

const CartSheetFooter = ({ closeSheet }: Props) => {
  const totalItems = useCartStore((s) => selectCartTotalQuantity(s));
  const { isAuthenticated, isLoading } = useAuth();

  if (totalItems === 0) return null;

  return (
    <SheetFooter className="border-t bg-card/80 p-4">
      {isAuthenticated ? (
        <Button asChild className="h-10 w-full">
          <Link href="/checkout" onClick={closeSheet}>
            Оформити замовлення
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="h-10 w-full" disabled={isLoading}>
              Оформити замовлення
              <ArrowRight className="size-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Потрібно увійти</AlertDialogTitle>
              <AlertDialogDescription>
                Увійдіть, щоб продовжити оформлення замовлення.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => signIn("google", { redirectTo: "/checkout" })}
              >
                Продовжити через Google
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Button onClick={closeSheet} variant="outline" className="h-10 w-full">
        <ShoppingBag className="size-4" />
        Продовжити покупки
      </Button>
    </SheetFooter>
  );
};

export default CartSheetFooter;
