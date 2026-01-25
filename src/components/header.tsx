"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Code, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link
          href="#"
          className="mr-6 flex items-center space-x-2 font-headline"
        >
          <Code className="h-6 w-6" />
          <span className="font-bold">Gomezgani Shaba</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          {isMounted && (
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open mobile menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex h-full flex-col py-6">
                  <Link
                    href="#"
                    className="mb-8 flex items-center space-x-2 font-headline"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Code className="h-6 w-6" />
                    <span className="font-bold">Gomezgani Shaba</span>
                  </Link>
                  <nav className="flex flex-col gap-6">
                    {navItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="text-lg font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
