
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";

export function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isHomePage && <Header />}
      <main className={`flex-1 w-full ${isHomePage ? 'header-hidden' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
