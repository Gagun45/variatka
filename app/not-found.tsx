import StateScreen from "@/components/state-screen/StateScreen";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { frontendUrls } from "@/lib/urls";
import { House, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main>
      <StateScreen
        title="Сторінку не знайдено"
        description="Сторінка, яку ви шукаєте, не існує або її було переміщено."
        icon={<SearchX />}
        action={
          <Button asChild>
            <Link href={frontendUrls.index}>
              <House />
              Повернутися на головну
            </Link>
          </Button>
        }
      />
    </main>
  );
}
