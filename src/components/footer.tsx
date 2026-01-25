import { Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Gomezgani Shaba. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com/gomeShaba" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://www.linkedin.com/in/gomezgani-s-27aa93247" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
