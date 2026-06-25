import { LogOut, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Loader from "../loader/Loader";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const AuthSidebar = () => {
  const { data: session, status } = useSession();
  if (status === "loading") return <Loader />;
  if (!session) {
    return (
      <Button value={"outline"} onClick={() => signIn("google")}>
        Login
      </Button>
    );
  }
  const { user: me } = session;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <User />
          {me.name}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{me.name}</span>
            {me.email && (
              <span className="text-muted-foreground text-xs">{me.email}</span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthSidebar;
