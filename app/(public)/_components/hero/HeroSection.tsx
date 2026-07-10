"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => {
  const categoriesToDisplay =
    FILTER_CONFIGS.publicRecipes.category.options.filter(
      (opt) => opt.value !== "all",
    );

  return (
    <section className="relative w-full overflow-hidden py-12 sm:py-8">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col items-center text-center gap-8">
        {/* Hero text (UNCHANGED) */}
        <div className="space-y-4 max-w-5xl">
          <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-foreground text-center leading-[1.15]">
            Відкрийте для себе{" "}
            <span className="bg-linear-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
              справжні смаки
            </span>
          </h1>

          <p className="text-base text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Каталог натуральних сумішей спецій, витончених соусів та домашнього
            повидла.
          </p>
        </div>

        {/* CTA */}
        <Button asChild size="lg" className="rounded-xl h-12">
          <Link href="/recipes">
            Переглянути весь асортимент <ArrowRight className="size-4" />
          </Link>
        </Button>

        {/* IMAGE-ONLY categories */}
        <div className="w-full mt-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-10 w-full">
            {categoriesToDisplay.map((opt) => (
              <Link
                key={opt.value}
                href={`/recipes?category=${opt.value}`}
                className="group block active:scale-[0.98] transition-transform"
              >
                <Card className="relative overflow-hidden border-0 rounded-2xl shadow-sm aspect-square">
                  <Image
                    src={opt.logo ?? ""}
                    alt={opt.value}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
