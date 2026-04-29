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
        <div className="bg-white/80 backdrop-blur-md border shadow-md rounded-2xl px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="text-xl font-semibold tracking-tight flex items-center gap-1">
            <img src="/logo.jpg" alt="logo" className="w-20 h-20" />
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">
              Features
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">
              Pricing
            </a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition">
              About
            </a>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">

           
           
           <Button
  variant="outline"
  className="border-gray-300 text-gray-800 hover:bg-gray-100"
  onClick={() => navigate("/login")}
>
  Login
</Button>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4">
              Try it free →
            </Button>

          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {/* ================= MOBILE MENU ================= */}
        {open && (
          <div className="md:hidden mt-3 bg-white rounded-2xl shadow-lg border p-5 animate-in fade-in slide-in-from-top-3">

            <nav className="flex flex-col gap-4 text-sm font-medium">
              <a href="#" className="text-gray-700 hover:text-blue-600">
                Home
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                Features
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                Pricing
              </a>
              <a href="#" className="text-gray-700 hover:text-blue-600">
                About
              </a>
            </nav>

            <div className="flex flex-col gap-3 mt-5">
              <Button variant="outline">Login</Button>
              <Button className="bg-blue-600 text-white">
                Try it free →
              </Button>
            </div>
   
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;