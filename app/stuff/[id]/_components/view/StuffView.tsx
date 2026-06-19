import StockBadge from "@/components/stock-badge/StockBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IStuff } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";
import Link from "next/link";
import DeleteStuff from "../delete/DeleteStuff";

interface Props {
  stuff: IStuff;
  isAdmin: boolean;
}

const StuffView = ({ stuff, isAdmin }: Props) => {
  const { description, inStock, stuffCategory, title, id } = stuff;
  return (
    <Card className="mx-auto">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="text-xl">{title}</CardTitle>

        <StockBadge inInStock={!!inStock} quantity={inStock} />
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="text-sm text-muted-foreground">
          Category:{" "}
          <span className="text-foreground font-medium">
            {stuffCategory.title}
          </span>
        </div>

        <Separator />

        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {isAdmin && (
          <div className="flex justify-end">
            <Link
              className={buttonVariants({ className: "px-8 text-base!" })}
              href={frontendUrls.stuff.edit(id)}
            >
              Edit
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StuffView;
