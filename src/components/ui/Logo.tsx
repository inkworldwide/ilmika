import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface LogoProps {
  className?: string;
  isScrolled?: boolean;
  theme?: "light" | "dark";
}

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <BookOpen className="w-full h-full text-accent" />
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = "",
  theme = "light",
}) => {
  return (
    <Link href="/" className={`group flex items-center gap-2 lg:gap-3 ${className}`}>
      {/* Icon */}
      <div className="relative flex items-center justify-center h-[36px] md:h-[40px] lg:h-[44px] min-w-[36px] md:min-w-[40px] lg:min-w-[44px] bg-primary rounded-xl shadow-sm">
        <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-accent" />
      </div>

      {/* Brand Text */}
      <div className="flex items-center text-[15px] sm:text-[17px] md:text-[19px] lg:text-[22px] font-extrabold tracking-[0.01em] whitespace-nowrap">
        <span className={`${theme === "dark" ? "text-white" : "text-[#0F172A]"}`}>Ink</span>
        <span className="text-[#D4AF37] mx-1">Edu</span>
        <span className={`${theme === "dark" ? "text-white" : "text-[#0F172A]"}`}>Verse</span>
      </div>
    </Link>
  );
};
