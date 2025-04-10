
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-primary">Kenya</span>Politico
                </Link>
                <Link to="/" className="hover:text-foreground/80">Dashboard</Link>
                <Link to="/politicians" className="hover:text-foreground/80">Politicians</Link>
                <Link to="/counties" className="hover:text-foreground/80">Counties</Link>
                <Link to="/parties" className="hover:text-foreground/80">Parties</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="hidden items-center gap-2 md:flex">
            <span className="text-xl font-bold text-primary">Kenya</span>
            <span className="text-xl font-bold">Politico</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <Link to="/" className="transition-colors hover:text-foreground/80">Dashboard</Link>
            <Link to="/politicians" className="transition-colors hover:text-foreground/80">Politicians</Link>
            <Link to="/counties" className="transition-colors hover:text-foreground/80">Counties</Link>
            <Link to="/parties" className="transition-colors hover:text-foreground/80">Parties</Link>
          </nav>
        </div>
        <form onSubmit={handleSearch} className="hidden md:flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search politicians..."
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>
    </header>
  );
}
