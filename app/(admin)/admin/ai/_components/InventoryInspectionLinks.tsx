import Link from "next/link";
import { Button } from "@/components/ui/button";
import { frontendUrls } from "@/lib/urls";

export default function InventoryInspectionLinks() {
  return <div className="flex flex-wrap gap-2">
    {[["Інгредієнти", frontendUrls.ingredients.index], ["Рецепти", frontendUrls.recipes.index], ["Матеріали", frontendUrls.stuff.index]].map(([label, href]) => <Button key={href} asChild variant="outline"><Link href={href} target="_blank" rel="noopener noreferrer">{label}</Link></Button>)}
  </div>;
}
