import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";



export default function Layout({ type = "public" }) {
  const location = useLocation();

  // Login page hide
  const hideOnRoutes = ["/login"];
  const shouldHide = hideOnRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {!shouldHide && <Navbar />}

      <main className="flex-1 min-h-[80vh]">
        <Outlet />
      </main>

      {!shouldHide && <Footer />}

      {/* ✅ Show ONLY on public routes and NOT on login */}
     {type === "public" && !shouldHide && (
  <>
 
  </>
)}
    </div>
    
  );
}
