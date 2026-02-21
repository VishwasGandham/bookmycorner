import React from "react";
import { Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-[#091e42] via-[#172b4d] to-[#091e42] text-white pt-10 pb-5">
      {/* container */}
      <div className="max-w-6xl mx-auto px-5 flex flex-wrap justify-between gap-8">
        {/* logo */}
        <div className="flex-1 min-w-[200px]">
          <h2 className="font-bold text-xl mb-2">BookMyCorner</h2>
          <p className="text-sm text-white/80">
            Your trusted property partner.
          </p>
        </div>

        {/* quick links */}
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/dashboard" className="hover:underline">
                Recently searched
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:underline">
                Recently viewed
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:underline">
                Shortlisted
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:underline">
                Contacted
              </Link>
            </li>
          </ul>
        </div>

        {/* about */}
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-semibold mb-2">About</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* support */}
        <div className="flex-1 min-w-[220px]">
          <h3 className="font-semibold mb-2">Support</h3>

          <p className="text-sm text-white/80 mb-2">
            Corporate office: SK 11 Sector 117, Noida 201304 <br />
            Lucknow office: 74 Ashok Vihar, Shaheed Path, Lucknow 226002
          </p>

          <p className="text-sm mb-1">
            Email:{" "}
            <a
              href="mailto:bookmycorner7@gmail.com"
              className="hover:underline"
            >
              bookmycorner7@gmail.com
            </a>{" "}
            ,{" "}
            <a
              href="mailto:contact@bookmycorner.com"
              className="hover:underline"
            >
              contact@bookmycorner.com
            </a>
          </p>

          <p className="text-sm">
            Mobile:{" "}
            <a href="tel:7310365365" className="hover:underline">
              7310-365-365
            </a>
          </p>
        </div>
      </div>

      {/* socials */}
      <div className="flex justify-center gap-4 mt-8">
        <a
          href="https://www.facebook.com/profile.php?id=61588457216544&sk=directory_intro"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full border border-white/70 flex items-center justify-center hover:bg-white/20 transition"
        >
          <Facebook className="w-4 h-4" />
        </a>

        <a
          href="https://www.instagram.com/bookmycornerindia/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full border border-white/70 flex items-center justify-center hover:bg-white/20 transition"
        >
          <Instagram className="w-4 h-4" />
        </a>
      </div>

      {/* bottom */}
      <div className="text-center text-sm mt-6 pt-4 border-t border-white/30">
        © {new Date().getFullYear()} BookMyCorner. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
