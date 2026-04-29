import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-6 border-t">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-5 gap-10">

        {/* ================= LEFT ================= */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.jpg" alt="logo" className="w-8 h-8" />
            <span className="text-lg font-semibold">Superio</span>
          </div>

          <p className="text-sm text-gray-600 mb-2">Call us</p>
          <p className="text-blue-600 font-semibold text-lg">
            9105009865
          </p>

          <p className="text-sm text-gray-500 mt-4 leading-relaxed">
            328 Queensberry Street, North Melbourne VIC <br />
            3051, Australia.
          </p>

          <p className="text-sm text-gray-500 mt-2">
            support@superio.com
          </p>
        </div>

        {/* ================= LINKS ================= */}
        <div>
          <h4 className="font-semibold mb-4">For Candidates</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Browse Jobs</li>
            <li>Browse Candidates</li>
            <li>Candidate Dashboard</li>
            <li>Job Alerts</li>
            <li>My Bookmarks</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">For Employers</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>All Employers</li>
            <li>Employer Dashboard</li>
            <li>Submit Job</li>
            <li>Job Packages</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">About Us</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Contact Us</li>
            <li>About Us</li>
            <li>Terms</li>   
            <li>Packages</li>
            <li>FAQ</li>
          </ul>
        </div>

        {/* ================= APP DOWNLOAD ================= */}
       

      </div>

      {/* ================= BOTTOM ================= */}
      <div className="border-t mt-10 pt-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-sm text-gray-500">
            © 2026 Superio. All Right Reserved.
          </p>

          <div className="flex gap-4 text-gray-500">
            <Facebook size={18} className="cursor-pointer hover:text-blue-600" />
            <Twitter size={18} className="cursor-pointer hover:text-blue-400" />
            <Instagram size={18} className="cursor-pointer hover:text-pink-500" />
            <Linkedin size={18} className="cursor-pointer hover:text-blue-700" />
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;