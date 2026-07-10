import StateScreen from "@/components/state-screen/StateScreen";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { frontendUrls } from "@/lib/urls";
import { House, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main>
      <StateScreen
        title="Page not found"
        description="The page you are looking for doesn't exist or has moved."
        icon={<SearchX />}
        action={
          <Button asChild>
            <Link href={frontendUrls.index}>
              <House />
              Go back home
            </Link>
          </Button>
        }
      />
    </main>
  );
}
