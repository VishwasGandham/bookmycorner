import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { trackSearch } from "./VisitorTracker";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const Hero = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [activeTab, setActiveTab] = useState<
    "buy" | "rent" | "commercial" | "plot"
  >("buy");

  const tabToType: Record<string, string> = {
    buy: "plot",
    rent: "house",
    commercial: "commercial",
    plot: "plot",
  };

  const handlePostPropertyClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (profile?.role === "seller" || profile?.role === "admin") {
      navigate("/post-property");
    } else {
      toast.warning("You need to be a seller to post property");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    trackSearch(searchQuery, budget);

    const params = new URLSearchParams();
    const type = tabToType[activeTab];

    if (type) params.set("type", type);
    if (searchQuery) params.set("city", searchQuery);
    if (budget) params.set("budget", budget);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="relative w-full text-white py-16 md:py-28 overflow-hidden">
      {/* PREMIUM background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        {/* Heading */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
          Find Your Perfect Plot of Land
        </h1>

        <p className="text-sm md:text-lg text-white/80 mb-10 max-w-2xl mx-auto">
          Explore verified plots, agricultural lands and commercial properties
          in your preferred location.
        </p>

        {/* CARD */}
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-4 md:p-6 text-left border border-white/40">
          {/* TOP BAR */}
          <div className="flex items-center justify-between border-b pb-3 gap-3">
            {/* Tabs scroll */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar">
              <div className="flex min-w-max gap-6 md:gap-10 text-sm md:text-lg font-semibold">
                {[
                  { key: "buy", label: "Buy" },
                  { key: "rent", label: "Rent" },
                  { key: "commercial", label: "Commercial" },
                  { key: "plot", label: "Plots/Land" },
                ].map((tab) => {
                  const active = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className="flex-shrink-0 cursor-pointer"
                    >
                      <div
                        className={`flex flex-col pb-2 transition ${
                          active
                            ? "text-blue-600"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span className="font-semibold">{tab.label}</span>

                        {/* premium underline */}
                        <span
                          className={`h-[3px] mt-1 rounded-full bg-blue-600 transition-all duration-300 ${
                            active ? "w-full opacity-100" : "w-0 opacity-0"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Property — PREMIUM */}
            <button
              onClick={handlePostPropertyClick}
              className="flex-shrink-0 cursor-pointer flex items-center gap-2 text-blue-600 font-semibold text-sm md:text-lg hover:text-blue-700 transition"
            >
              Post Property
              <span className="text-[11px] md:text-xs bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full backdrop-blur border border-blue-500/20">
                FREE
              </span>
            </button>
          </div>

          {/* SEARCH */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-2 mt-4"
          >
            <div className="flex-1 flex items-center px-3 border rounded-xl md:border-r border-slate-200 bg-white">
              <MapPin className="text-muted-foreground w-5 h-5 mr-2" />
              <Input
                type="text"
                placeholder="Enter City, Locality or Project"
                className="border-0 shadow-none focus-visible:ring-0 text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="w-full md:w-48 flex items-center px-3 border rounded-xl border-slate-200 bg-white">
              <select
                className="w-full bg-transparent border-0 text-slate-700 text-sm outline-none"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="">Budget</option>
                <option value="0-10L">Below 10 Lacs</option>
                <option value="10L-20L">10 - 20 Lacs</option>
                <option value="20L-50L">20 - 50 Lacs</option>
                <option value="50L-1Cr">50 Lacs - 1 Cr</option>
                <option value="1Cr+">Above 1 Cr</option>
              </select>
            </div>

            <Button
              size="lg"
              className="w-full md:w-auto px-8 rounded-xl shadow-md"
              type="submit"
            >
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;
