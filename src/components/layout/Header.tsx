
import { Link } from "react-router-dom";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="hidden font-bold sm:inline-block">
            Political Baseline
          </span>
        </Link>

        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/politicians" className="transition-colors hover:text-primary">
            Politicians
          </Link>
          <Link to="/counties" className="transition-colors hover:text-primary">
            Counties
          </Link>
          <Link to="/parties" className="transition-colors hover:text-primary">
            Parties
          </Link>
          <Link to="/community" className="transition-colors hover:text-primary">
            Community
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
