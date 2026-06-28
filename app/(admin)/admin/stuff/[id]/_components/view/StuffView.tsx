import StockBadge from "@/components/stock-badge/StockBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ViewItemCategory from "@/components/view-item/ViewItemCategory";
import ViewItemDescription from "@/components/view-item/ViewItemDescription";
import ViewItemEditLink from "@/components/view-item/ViewItemEditLink";
import { STUFF_CATEGORIES_DATA } from "@/lib/enumslist/stuff.constants";
import { IStuff } from "@/lib/prisma.args";
import { frontendUrls } from "@/lib/urls";

interface Props {
  stuff: IStuff;
}

const StuffView = ({ stuff }: Props) => {
  const { description, inStock, id, category } = stuff;
  const categoryTitle = STUFF_CATEGORIES_DATA[category].label;
  return (
    <Card>
      <CardHeader className="view-item-card-header">
        <div className="view-item-card-header-row">
          <ViewItemCategory categoryTitle={categoryTitle} />
          <StockBadge isInStock={!!inStock} quantity={inStock} />
        </div>
        <div className="view-item-card-header-row">
          <ViewItemDescription description={description} />
        </div>
      </CardHeader>

      <CardContent className="view-item-card-content">
        <ViewItemEditLink href={frontendUrls.stuff.edit(id)} />
      </CardContent>
    </Card>
  );
};

export default StuffView;
