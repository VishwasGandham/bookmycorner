import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useRef } from "react";
import {
  MapPin,
  Phone,
  MessageSquare,
  Heart,
  Share2,
  Shield,
  Eye,
  Ruler,
  Compass,
  FileCheck,
  CheckCircle2,
  ArrowLeft,
  IndianRupee,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { Database } from "../lib/database.types";
import LeadModal from "../components/features/LeadModal";
import { useViewCounter } from "../hooks/useViewCounter";
import { trackClick } from "../components/features/VisitorTracker";

type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  profiles?: { full_name: string };
};

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [modalType, setModalType] = useState<
    "callback" | "site_visit" | "best_price" | "whatsapp" | null
  >(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const [favLoading, setFavLoading] = useState(false);

  /* AUTO IMAGE CAROUSEL */
  useEffect(() => {
    if (!property?.images || property.images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((prev) => {
        const next = prev === property.images!.length - 1 ? 0 : prev + 1;

        setProgressKey((k) => k + 1); // restart progress animation
        return next;
      });
    }, 3000); // change speed here

    return () => clearInterval(interval);
  }, [property]);

  useViewCounter(id || "");

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*, profiles!owner_id(full_name)")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProperty(data as any);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !id) return;
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("property_id", id)
        .maybeSingle();
      setIsFavorited(!!data);
    };
    checkFavorite();
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) {
      alert("Please log in to save properties.");
      return;
    }
    if (!id) return;
    setFavLoading(true);
    try {
      if (isFavorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", id);
        setIsFavorited(false);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, property_id: id } as any);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title || "Property",
          text: `Check out this property!`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading property...</span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Property Not Found</h2>
        <p className="text-muted-foreground">
          This property may have been removed or doesn't exist.
        </p>
        <Button asChild>
          <Link to="/">← Back to Home</Link>
        </Button>
      </div>
    );
  }

  const images =
    property.images && property.images.length > 0
      ? property.images
      : [
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
        ];

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} L`;
    return `₹ ${price.toLocaleString()}`;
  };

  const mockCoordsByLocation: Record<string, { lat: number; lng: number }> = {
    "KPHB Colony": { lat: 17.493118806046148, lng: 78.40245349571215 },
    "Budge Budge , Koila Sarak": {
      lat: 22.484267307506983,
      lng: 88.17872642543773,
    },
  };

  const coords = property ? mockCoordsByLocation[property.location] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          to={`/search?city=${property.city}`}
          className="hover:text-primary transition-colors capitalize"
        >
          {property.city}
        </Link>
        <span>/</span>
        <span className="capitalize">{property.location}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-100">
              <img
                src={images[activeImage]}
                alt={property.title}
                className="object-cover w-full h-full"
              />

              {/* ✅ ADDED contact icon inside image */}
              <button
                onClick={() =>
                  contactRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="absolute bottom-4 right-4 z-40 rounded-full shadow-lg bg-primary text-white p-3"
                aria-label="Go to contact"
              >
                <Phone className="w-5 h-5" />
              </button>

              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className={`rounded-full ${isFavorited ? "bg-red-100 text-red-500 hover:bg-red-200" : ""}`}
                  onClick={toggleFavorite}
                  disabled={favLoading}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorited ? "fill-red-500" : ""}`}
                  />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <Eye className="w-3 h-3 mr-1" /> {property.views_count || 0}{" "}
                views
              </div>

              {property.is_featured && (
                <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ Featured
                </div>
              )}

              {/* Premium slide progress bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30">
                <div
                  key={progressKey}
                  className="h-full bg-white animate-slide-progress"
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-gray-300"}`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Info */}
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.landmark ? `${property.landmark}, ` : ""}
                  {property.location}, {property.city}
                </div>
              </div>
              <div className="md:text-right">
                <div className="text-3xl font-bold text-primary whitespace-nowrap">
                  {formatPrice(property.price)}
                </div>
                <div className="text-sm text-muted-foreground">
                  @ ₹ {(property.price / property.area).toFixed(0)}/sq.ft
                </div>
                {property.negotiable && (
                  <span className="text-xs text-green-600 font-medium">
                    Price Negotiable
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Area: {property.area} sq.ft
              </Badge>
              <Badge
                variant="secondary"
                className="text-sm px-3 py-1 capitalize"
              >
                {property.type}
              </Badge>
              {property.is_verified && (
                <Badge className="bg-green-600 hover:bg-green-700 text-sm px-3 py-1 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Verified
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-sm px-3 py-1 capitalize opacity-70"
              >
                {property.status}
              </Badge>
              {property.corner_plot && (
                <Badge className="bg-amber-500 text-sm px-3 py-1">
                  Corner Plot
                </Badge>
              )}
            </div>

            {/* Overview Grid */}
            <Card className="p-6 bg-slate-50 border-none">
              <h3 className="font-semibold text-lg mb-4">Property Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <Ruler className="w-3 h-3 mr-1" /> Dimensions
                  </div>
                  <div className="font-medium">
                    {property.length || "-"} x {property.width || "-"} ft
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <Compass className="w-3 h-3 mr-1" /> Facing
                  </div>
                  <div className="font-medium">{property.facing || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Road Width (Front)
                  </div>
                  <div className="font-medium">
                    {property.road_width_front || "-"} ft
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Approvals
                  </div>
                  <div className="font-medium capitalize">
                    {property.layout_approval_status || "Pending"}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">About This Property</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description || "No description provided."}
            </p>
          </div>

          {/* Documents & Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">Legal & Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`flex items-center gap-3 p-4 border rounded-lg ${property.registration_available ? "border-green-200 bg-green-50" : "border-gray-200"}`}
              >
                <FileCheck
                  className={`w-5 h-5 ${property.registration_available ? "text-green-500" : "text-gray-400"}`}
                />
                <div>
                  <span
                    className={`font-medium ${property.registration_available ? "text-green-800" : "text-muted-foreground"}`}
                  >
                    Registration Available
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {property.registration_available
                      ? "Ready for immediate registration"
                      : "Not available yet"}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-3 p-4 border rounded-lg ${property.documents_available ? "border-green-200 bg-green-50" : "border-gray-200"}`}
              >
                <CheckCircle2
                  className={`w-5 h-5 ${property.documents_available ? "text-green-500" : "text-gray-400"}`}
                />
                <div>
                  <span
                    className={`font-medium ${property.documents_available ? "text-green-800" : "text-muted-foreground"}`}
                  >
                    Clear Documents
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {property.documents_available
                      ? "All legal documents available"
                      : "Documents pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Contact */}
        <div className="lg:col-span-1">
          <div ref={contactRef}>
            <Card className="sticky top-24 p-6 shadow-lg border-t-4 border-t-primary">
              <h3 className="text-xl font-bold mb-2">
                Interested in this property?
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Contact the seller directly to get more information.
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full h-12 text-base"
                  onClick={() => {
                    setModalType("whatsapp");
                    trackClick("contact_whatsapp", { propertyId: property.id });
                  }}
                >
                  <MessageSquare className="mr-2 h-5 w-5" /> Chat on WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base border-primary text-primary hover:bg-primary/5"
                  onClick={() => {
                    setModalType("callback");
                    trackClick("contact_callback", { propertyId: property.id });
                  }}
                >
                  <Phone className="mr-2 h-5 w-5" /> Request Callback
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setModalType("site_visit");
                    trackClick("contact_site_visit", {
                      propertyId: property.id,
                    });
                  }}
                >
                  📅 Schedule Site Visit
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    setModalType("best_price");
                    trackClick("contact_best_price", {
                      propertyId: property.id,
                    });
                  }}
                >
                  💰 Get Best Price
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Seller Information</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-lg">
                    {property.profiles?.full_name?.charAt(0)?.toUpperCase() ||
                      "S"}
                  </div>
                  <div>
                    <div className="font-medium">
                      {property.profiles?.full_name || "Seller"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {property.is_verified ? (
                        <>
                          <Shield className="h-3 w-3 text-green-500" /> Verified
                          Seller
                        </>
                      ) : (
                        "Seller"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Views: {property.views_count}</span>
                  <span>Leads: {property.leads_count}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Listed on{" "}
                  {new Date(property.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {modalType && (
        <LeadModal
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
          propertyId={property.id}
          type={modalType}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
