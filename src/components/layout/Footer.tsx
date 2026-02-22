import React, { useState } from "react";
import { Facebook, Instagram, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (section: string) => {
    setOpen(open === section ? null : section);
  };

  const Accordion = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-white/20 md:border-none">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between py-4 md:py-0"
      >
        <h3 className="font-semibold text-left">{title}</h3>
        <span className="md:hidden">
          {open === id ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 md:block ${
          open === id ? "max-h-96 pb-4" : "max-h-0 md:max-h-none"
        }`}
      >
        {children}
      </div>
    </div>
  );

  return (
    <footer className="w-full bg-gradient-to-r from-[#091e42] via-[#172b4d] to-[#091e42] text-white pt-10 pb-5">
      <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-4 gap-6">
        {/* Brand */}
        <div>
          <h2 className="font-bold text-xl mb-2">BookMyCorner</h2>
          <p className="text-sm text-white/80">
            Your trusted property partner.
          </p>
        </div>

        {/* Quick links */}
        <Accordion id="quick" title="Quick Links">
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link to="/dashboard">Recently searched</Link>
            </li>
            <li>
              <Link to="/dashboard">Recently viewed</Link>
            </li>
            <li>
              <Link to="/dashboard">Shortlisted</Link>
            </li>
            <li>
              <Link to="/dashboard">Contacted</Link>
            </li>
          </ul>
        </Accordion>

        {/* About */}
        <Accordion id="about" title="About">
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
          </ul>
        </Accordion>

        {/* Support */}
        <Accordion id="support" title="Support">
          <div className="text-sm text-white/80 space-y-2">
            <p>
              Corporate office: SK 11 Sector 117, Noida 201304 <br />
              Lucknow office: 74 Ashok Vihar, Shaheed Path, Lucknow 226002
            </p>

            <p>
              Email:{" "}
              <a
                href="mailto:bookmycorner7@gmail.com"
                className="hover:underline"
              >
                bookmycorner7@gmail.com
              </a>
            </p>

            <p>
              Mobile:{" "}
              <a href="tel:7310365365" className="hover:underline">
                7310-365-365
              </a>
            </p>
          </div>
        </Accordion>
      </div>

      {/* socials */}
      <div className="flex justify-center gap-4 mt-8">
        <a
          href="https://www.facebook.com/profile.php?id=61588457216544"
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
