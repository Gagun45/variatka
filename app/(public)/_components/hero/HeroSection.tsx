// @/components/home/HeroSection.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { FILTER_CONFIGS } from "@/lib/enumslist/filter.config";

export const HeroSection = () => {
  // Loop through your exact filter variable options, filtering out 'all'
  const categoriesToDisplay =
    FILTER_CONFIGS.publicRecipes.category.options.filter(
      (opt) => opt.value !== "all",
    );

  return (
    <section className="relative w-full overflow-hidden bg-background py-20 sm:py-28">
      {/* Background Accent Spotlight */}
      <div className="absolute top-0 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-muted/40 blur-3xl" />

      <div className="container mx-auto px-4 max-w-6xl flex flex-col items-center text-center gap-8">
        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/80 shadow-xs backdrop-blur-xs">
          <Sparkles className="size-4 text-amber-500 animate-pulse" />
          <span className="text-xs font-semibold text-muted-foreground">
            Крафтові продукти та авторські смаки
          </span>
        </div>

        {/* Product Catalog Centric Headers */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
            Відкрийте для себе{" "}
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
              справжні смаки
            </span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Каталог натуральних сумішей спецій, витончених соусів та домашнього
            повидла. Зручний пошук, актуальна наявність та повний контроль ваших
            запасів.
          </p>
        </div>

        {/* Primary Call to Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
          <Button
            asChild
            size="lg"
            className="h-12 px-6 font-semibold shadow-sm active:scale-95 transition-all rounded-xl gap-2 w-full sm:w-auto"
          >
            <Link href="/recipes">
              {" "}
              {/* Keeping your existing '/recipes' route path matching your components */}
              Переглянути весь асортимент <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Dynamic Category Quick-Links Matrix */}
        <div className="w-full mt-10 space-y-4 ">
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Швидкий вибір категорії
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full text-left">
            {categoriesToDisplay.map((opt) => {
              const CategoryIcon = opt.icon;

              return (
                <Link
                  key={opt.value}
                  href={`/recipes?category=${opt.value}`}
                  className="group block active:scale-[0.98] transition-all duration-200"
                >
                  <Card className="overflow-hidden border border-border bg-card hover:bg-accent/50 hover:border-border/80 transition-all shadow-xs group-hover:shadow-md rounded-2xl h-full">
                    <CardContent className="p-5 flex items-center gap-4 relative h-full">
                      {/* Standard structural icon box wrapper using your dynamic icon color */}
                      <div className="p-3 rounded-xl shrink-0 bg-secondary/80 dark:bg-secondary/40 group-hover:scale-110 transition-transform duration-200">
                        {CategoryIcon && (
                          <CategoryIcon
                            className={`size-5 ${opt.iconClassName || ""}`}
                          />
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1 pr-4">
                        <h3 className="text-sm font-bold text-card-foreground group-hover:text-foreground transition-colors">
                          {opt.label}
                        </h3>
                      </div>

                      <ArrowRight className="size-4 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0 transition-all text-muted-foreground hidden sm:block" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
