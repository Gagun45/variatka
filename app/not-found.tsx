import Link from "next/link";
import { Button } from "@/components/ui/button";
import { frontendUrls } from "@/lib/urls";

export default function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <p className="text-muted-foreground">Page not found</p>

      <Button asChild>
        <Link href={frontendUrls.index}>Go back home</Link>
      </Button>
    </main>
  );
}
