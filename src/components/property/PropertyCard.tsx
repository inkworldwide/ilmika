"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, BedDouble, Bath, Ruler, Heart, ShieldCheck, ArrowUpRight } from "lucide-react";

interface PropertyImage {
  url: string;
  category?: string;
}

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    slug: string;
    price: number | any;
    transactionType: string;
    propertyType: string;
    bhk: number | null;
    bathrooms: number | null;
    carpetArea: number;
    areaUnit: string;
    isVerified: boolean;
    isFeatured: boolean;
    furnishingStatus: string;
    locality: { name: string };
    city: { name: string };
    images: PropertyImage[];
  };
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function PropertyCard({ property, onMouseEnter, onMouseLeave }: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  // Format price in Indian style: Lakh, Crore, or Thousands
  const formatIndianCurrency = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Crore`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹${num.toLocaleString("en-IN")}`;
    }
  };

  const priceValue = property.price 
    ? (typeof property.price === "object" 
      ? parseFloat((property.price as any).toString()) 
      : parseFloat(property.price.toString()))
    : 0;

  const formattedPrice = formatIndianCurrency(priceValue);
  const coverImage = property.images && property.images.length > 0 
    ? property.images[0].url 
    : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    // Future API call will sync favourites
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="bg-white border border-line rounded-2xl overflow-hidden group flex flex-col justify-between h-full transition duration-300 relative"
    >
      <Link href={`/properties/${property.id}`} className="block flex-1 flex flex-col">
        {/* Card Header Media */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={coverImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {property.isVerified && (
              <span className="flex items-center gap-1 bg-accent text-primary text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                VERIFIED
              </span>
            )}
            {property.isFeatured && (
              <span className="bg-primary text-accent text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                FEATURED
              </span>
            )}
          </div>

          {/* Transaction Tag */}
          <span className="absolute bottom-3 left-3 bg-primary text-secondary text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md">
            FOR {property.transactionType}
          </span>

          {/* Heart Like Action */}
          <button
            onClick={handleLikeToggle}
            type="button"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 grid place-items-center hover:bg-white text-slate-400 hover:text-red-500 transition shadow-sm cursor-pointer"
            aria-label="Save listing"
          >
            <motion.div
              animate={{ scale: isLiked ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`w-4.5 h-4.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            </motion.div>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-base text-primary leading-snug font-semibold line-clamp-2">
                {property.title}
              </h3>
            </div>
            
            <p className="flex items-center gap-1 text-[13px] text-slate-500 mt-2 font-medium">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">{property.locality.name}, {property.city.name}</span>
            </p>

            {/* Separator */}
            <div className="w-full h-px bg-line/80 my-3"></div>

            {/* Config Specs */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              {property.bhk && (
                <span className="flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-slate-400 shrink-0" />
                  {property.bhk} BHK
                </span>
              )}
              {property.bathrooms && (
                <span className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 text-slate-400 shrink-0" />
                  {property.bathrooms} Bath
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-slate-400 shrink-0" />
                {property.carpetArea} {property.areaUnit}
              </span>
            </div>
          </div>

          {/* Pricing & CTA footer */}
          <div className="flex items-center justify-between border-t border-line/60 pt-4 mt-4">
            <span className="price-tag bg-primary text-accent text-sm font-mono font-bold px-3 py-1.5 mr-2">
              {formattedPrice}{property.transactionType === "RENT" ? "/mo" : ""}
            </span>
            
            <span className="text-[11px] font-mono font-bold text-accent hover:text-accent-hover transition flex items-center gap-0.5 uppercase tracking-wider group-hover:translate-x-1 duration-200">
              Details
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
