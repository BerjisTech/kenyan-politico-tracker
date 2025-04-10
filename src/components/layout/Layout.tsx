
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-4 bg-muted/40">
        <div className="container flex flex-col gap-2 md:flex-row items-center justify-between text-center md:text-left text-sm">
          <p>© 2025 Kenya Politico Tracker. All rights reserved.</p>
          <nav className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
