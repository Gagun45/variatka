import { IUserWithWishlist } from "@/lib/prisma.args";
import AdminWishlistCard from "./card/AdminWishlistCard";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  users: IUserWithWishlist[];
}

const AdminWishlistsList = ({ users }: Props) => {
  return (
    <Accordion type="multiple" className="w-full h-auto">
      {users.map((user) => (
        <AccordionItem
          key={user.id}
          value={user.id.toString()}
          className="border py-2 px-4 rounded-md"
        >
          <AccordionTrigger>
            <div className="flex w-full items-center justify-between pr-2">
              <span className="font-medium">{user.name}</span>

              <span className="text-sm text-muted-foreground">
                {user.withlistItems.length} recipes
              </span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="flex flex-col gap-2 pt-2">
              <AdminWishlistCard user={user} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AdminWishlistsList;
