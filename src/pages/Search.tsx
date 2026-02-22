// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import PropertyCard, {
//   type PropertyProps,
// } from "../components/features/PropertyCard";
// import SEO from "../components/layout/SEO";
// import { Button } from "../components/ui/Button";
// import { Input } from "../components/ui/Input";
// import { Card, CardContent } from "../components/ui/Card";
// import { Search as SearchIcon, MapPin, Filter, X } from "lucide-react";
// import { supabase } from "../lib/supabase";

// const Search = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [city, setCity] = useState(searchParams.get("city") || "");
//   const [budget, setBudget] = useState(searchParams.get("budget") || "");
//   const [type, setType] = useState(searchParams.get("type") || "");
//   const [results, setResults] = useState<PropertyProps[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [totalCount, setTotalCount] = useState(0);
//   const [showFilters, setShowFilters] = useState(true);

//   useEffect(() => {
//     handleSearch();
//   }, []);

//   const mapProperty = (p: any): PropertyProps => ({
//     id: p.id,
//     title: p.title,
//     price: p.price,
//     area: p.area,
//     location: p.location,
//     city: p.city,
//     type: p.type,
//     status: p.status,
//     image:
//       p.images?.[0] ||
//       "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
//     isVerified: p.is_verified,
//     viewsCount: p.views_count || 0,
//   });

//   const handleSearch = async () => {
//     setLoading(true);
//     try {
//       let query = supabase
//         .from("properties")
//         .select("*", { count: "exact" })
//         .eq("status", "available");

//       if (city.trim()) {
//         query = query.or(
//           `city.ilike.%${city.trim()}%,location.ilike.%${city.trim()}%`,
//         );
//       }

//       if (type) {
//         query = query.eq("type", type as "plot" | "house" | "apartment");
//       }

//       if (budget) {
//         const budgetRanges: Record<string, [number, number]> = {
//           "0-10L": [0, 1000000],
//           "10L-20L": [1000000, 2000000],
//           "20L-50L": [2000000, 5000000],
//           "50L-1Cr": [5000000, 10000000],
//           "1Cr+": [10000000, 999999999],
//         };
//         const range = budgetRanges[budget];
//         if (range) {
//           query = query.gte("price", range[0]).lte("price", range[1]);
//         }
//       }

//       query = query.order("created_at", { ascending: false }).limit(20);

//       const { data, count, error } = await query;
//       if (error) throw error;

//       setResults((data || []).map(mapProperty));
//       setTotalCount(count || 0);

//       // Update URL params
//       const params = new URLSearchParams();
//       if (city) params.set("city", city);
//       if (budget) params.set("budget", budget);
//       if (type) params.set("type", type);
//       setSearchParams(params, { replace: true });
//     } catch (error) {
//       console.error("Search error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearFilters = () => {
//     setCity("");
//     setBudget("");
//     setType("");
//   };

//   const hasFilters = city || budget || type;

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <SEO title={`Search Results${city ? ` - ${city}` : ""}`} />

//       <div className="bg-white border-b border-border sticky top-16 z-40">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center gap-4">
//             <div className="flex-1 flex items-center gap-2">
//               <div className="flex-1 flex items-center border border-border rounded-lg px-3">
//                 <MapPin className="w-4 h-4 text-muted-foreground" />
//                 <Input
//                   type="text"
//                   placeholder="City, locality or project..."
//                   className="border-0 shadow-none focus-visible:ring-0"
//                   value={city}
//                   onChange={(e) => setCity(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                 />
//               </div>
//               <Button onClick={handleSearch} className="px-6">
//                 <SearchIcon className="w-4 h-4 mr-2" /> Search
//               </Button>
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setShowFilters(!showFilters)}
//             >
//               <Filter className="w-4 h-4 mr-1" /> Filters
//             </Button>
//           </div>

//           {showFilters && (
//             <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap">
//               <select
//                 className="bg-white border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
//                 value={budget}
//                 onChange={(e) => setBudget(e.target.value)}
//               >
//                 <option value="">Any Budget</option>
//                 <option value="0-10L">Below 10 Lacs</option>
//                 <option value="10L-20L">10 - 20 Lacs</option>
//                 <option value="20L-50L">20 - 50 Lacs</option>
//                 <option value="50L-1Cr">50 Lacs - 1 Cr</option>
//                 <option value="1Cr+">Above 1 Cr</option>
//               </select>

//               <select
//                 className="bg-white border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
//                 value={type}
//                 onChange={(e) => setType(e.target.value)}
//               >
//                 <option value="">All Types</option>
//                 <option value="plot">Plot</option>
//                 <option value="house">House</option>
//                 <option value="apartment">Apartment</option>
//               </select>

//               {hasFilters && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={clearFilters}
//                   className="text-red-500 hover:text-red-600"
//                 >
//                   <X className="h-4 w-4 mr-1" /> Clear
//                 </Button>
//               )}

//               <Button size="sm" onClick={handleSearch}>
//                 Apply Filters
//               </Button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Results */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-2xl font-bold">
//             {loading ? "Searching..." : `${totalCount} Properties Found`}
//           </h1>
//         </div>

//         {!loading && results.length === 0 && (
//           <Card className="p-10 text-center">
//             <CardContent className="flex flex-col items-center gap-4">
//               <SearchIcon className="h-12 w-12 text-muted-foreground" />
//               <h3 className="text-xl font-semibold">No properties found</h3>
//               <p className="text-muted-foreground max-w-md">
//                 Try adjusting your search criteria or clearing filters to see
//                 more results.
//               </p>
//               {hasFilters && (
//                 <Button variant="outline" onClick={clearFilters}>
//                   Clear All Filters
//                 </Button>
//               )}
//             </CardContent>
//           </Card>
//         )}

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {results.map((p) => (
//             <PropertyCard key={p.id} property={p} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Search;

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard, {
  type PropertyProps,
} from "../components/features/PropertyCard";
import SEO from "../components/layout/SEO";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import { Search as SearchIcon, MapPin, Filter, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [type, setType] = useState("");

  const [results, setResults] = useState<PropertyProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  /* ---------------- URL → STATE SYNC (IMPORTANT) ---------------- */
  useEffect(() => {
    const cityParam = searchParams.get("city") || "";
    const budgetParam = searchParams.get("budget") || "";
    const typeParam = searchParams.get("type") || "";

    setCity(cityParam);
    setBudget(budgetParam);
    setType(typeParam);

    fetchResults(cityParam, budgetParam, typeParam);
  }, [searchParams]);

  /* ---------------- MAPPER ---------------- */
  const mapProperty = (p: any): PropertyProps => ({
    id: p.id,
    title: p.title,
    price: p.price,
    area: p.area,
    location: p.location,
    city: p.city,
    type: p.type,
    status: p.status,
    image:
      p.images?.[0] ||
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    isVerified: p.is_verified,
    viewsCount: p.views_count || 0,
  });

  /* ---------------- FETCH ---------------- */
  const fetchResults = async (
    cityValue: string,
    budgetValue: string,
    typeValue: string,
  ) => {
    setLoading(true);

    try {
      let query = supabase
        .from("properties")
        .select("*", { count: "exact" })
        .eq("status", "available");

      if (cityValue.trim()) {
        query = query.or(
          `city.ilike.%${cityValue.trim()}%,location.ilike.%${cityValue.trim()}%`,
        );
      }

      if (typeValue) {
        query = query.eq("type", typeValue as any);
      }

      if (budgetValue) {
        const budgetRanges: Record<string, [number, number]> = {
          "0-10L": [0, 1000000],
          "10L-20L": [1000000, 2000000],
          "20L-50L": [2000000, 5000000],
          "50L-1Cr": [5000000, 10000000],
          "1Cr+": [10000000, 999999999],
        };

        const range = budgetRanges[budgetValue];
        if (range) {
          query = query.gte("price", range[0]).lte("price", range[1]);
        }
      }

      query = query.order("created_at", { ascending: false }).limit(20);

      const { data, count, error } = await query;
      if (error) throw error;

      setResults((data || []).map(mapProperty));
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HANDLE SEARCH (UI → URL) ---------------- */
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (city) params.set("city", city);
    if (budget) params.set("budget", budget);
    if (type) params.set("type", type);

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = city || budget || type;

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO title={`Search Results${city ? ` - ${city}` : ""}`} />

      {/* Top Search Bar */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 flex items-center border border-border rounded-lg px-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="City, locality or project..."
                  className="border-0 shadow-none focus-visible:ring-0"
                />
              </div>

              <Button onClick={handleSearch} className="px-6">
                <SearchIcon className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-1" /> Filters
            </Button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap">
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-white border border-border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Any Budget</option>
                <option value="0-10L">Below 10 Lacs</option>
                <option value="10L-20L">10 - 20 Lacs</option>
                <option value="20L-50L">20 - 50 Lacs</option>
                <option value="50L-1Cr">50 Lacs - 1 Cr</option>
                <option value="1Cr+">Above 1 Cr</option>
              </select>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-white border border-border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="plot">Plot</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
              </select>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-500"
                >
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}

              <Button size="sm" onClick={handleSearch}>
                Apply Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {loading ? "Searching..." : `${totalCount} Properties Found`}
        </h1>

        {!loading && results.length === 0 && (
          <Card className="p-10 text-center">
            <CardContent className="flex flex-col items-center gap-4">
              <SearchIcon className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold">No properties found</h3>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your search criteria or clearing filters.
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
