import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-4 left-0 w-full z-50 px-3">
      <div className="max-w-7xl mx-auto">

        {/* Container */}
        <div className="border-border/80 bg-card/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/75 rounded-2xl border px-5 h-14 flex items-center justify-between">

          {/* Logo */}
          <div className="text-xl font-semibold tracking-tight flex items-center gap-1">
            <img src="/logo.jpg" alt="logo" className="h-10 w-auto object-contain" />
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">

           
           
           <Button
  variant="outline"
  onClick={() => navigate("/login")}
>
  Login
</Button>

            <Button className="shadow-sm">
              Try it free →
            </Button>

          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {/* ================= MOBILE MENU ================= */}
        {open && (
          <div className="md:hidden mt-3 rounded-2xl border border-border bg-card p-5 shadow-lg">

            <nav className="flex flex-col gap-4 text-sm font-medium">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Home
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Features
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Pricing
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                About
              </a>
            </nav>

            <div className="flex flex-col gap-3 mt-5">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button>Try it free →</Button>
            </div>
   
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;