import { LogOut, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LoadingButton } from "../loading-btn/LoadingButton";

const AuthSidebar = () => {
  const { data: session, status } = useSession();
  if (status === "loading")
    return (
      <LoadingButton variant={"outline"} className="w-fit" isPending={true}>
        {null}
      </LoadingButton>
    );
  if (!session) {
    return (
      <Button value={"outline"} onClick={() => signIn("google")}>
        Увійти
      </Button>
    );
  }
  const { user: me } = session;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="max-w-40 gap-2">
          <User className="shrink-0" />

          <span className="truncate">{me.name}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="tr">{me.name}</span>
            {me.email && (
              <span className="text-muted-foreground text-xs">{me.email}</span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile">Профіль</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut />
          Вийти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthSidebar;
