import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { MapPin, Heart, Share2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export interface PropertyProps {
  id: string;
  title: string;
  price: number;
  area: number;
  location: string;
  city: string;
  type: string;
  status: string;
  image: string;
  isVerified?: boolean;
  viewsCount?: number;
}

const PropertyCard = ({ property }: { property: PropertyProps }) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (user) checkFavorite();
  }, [user, property.id]);

  const checkFavorite = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("property_id", property.id)
      .maybeSingle();
    setIsFavorited(!!data);
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please log in to save properties.");
      return;
    }
    setFavLoading(true);
    try {
      if (isFavorited) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("property_id", property.id);
        setIsFavorited(false);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, property_id: property.id } as any);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/property/${property.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out: ${property.title}`,
          url,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} L`;
    return `₹ ${price.toLocaleString()}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex gap-2">
          {property.isVerified && (
            <Badge className="bg-green-600 hover:bg-green-700">Verified</Badge>
          )}
          <Badge variant="secondary" className="capitalize">
            {property.type}
          </Badge>
          {property.status === "pending" && (
            <Badge className="bg-orange-500 hover:bg-orange-600">
              Pending Review
            </Badge>
          )}
          {property.status === "rejected" && (
            <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
          )}
          {property.status === "sold" && (
            <Badge className="bg-gray-500 hover:bg-gray-600">Sold</Badge>
          )}
        </div>
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className={`h-8 w-8 rounded-full ${isFavorited ? "bg-red-100 text-red-500 hover:bg-red-200" : ""}`}
            onClick={toggleFavorite}
            disabled={favLoading}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500" : ""}`} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        {property.viewsCount !== undefined && property.viewsCount > 0 && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Eye className="h-3 w-3" /> {property.viewsCount}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">
            {property.title}
          </h3>
          <span className="font-bold text-primary whitespace-nowrap">
            {formatPrice(property.price)}
          </span>
        </div>

        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="truncate">
            {property.location}, {property.city}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm border-t pt-3 mt-1">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase font-medium">
              Area
            </span>
            <span className="font-medium">{property.area} sq.ft</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase font-medium">
              Avg. Price
            </span>
            <span className="font-medium">
              ₹ {(property.price / property.area).toFixed(0)} / sq.ft
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link to={`/property/${property.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
