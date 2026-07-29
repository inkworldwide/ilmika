import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  isScrolled?: boolean;
  theme?: "light" | "dark";
}

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img src="/logo.png" alt="RE OneStopPage Logo Icon" className="w-full h-full object-contain scale-[1.4]" />
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = "",
  theme = "light",
}) => {
  return (
    <Link href="/" className={`group flex items-center gap-1 sm:gap-2 lg:gap-3 ${className}`}>
      {/* 
        Logo Image 
        Container defines the space, scale transforms the image to remove transparent padding without cropping
      */}
      <div className="relative flex items-center justify-center h-[42px] md:h-[50px] lg:h-[64px] min-w-[42px] md:min-w-[50px] lg:min-w-[64px]">
        <img 
          src="/logo.png" 
          alt="RE OneStopPage Logo" 
          className="absolute inset-0 w-full h-full object-contain scale-[1.45] md:scale-[1.5] transform origin-center" 
        />
      </div>

      {/* Brand Text */}
      <div className="flex items-center text-[15px] sm:text-[17px] md:text-[19px] lg:text-[22px] font-extrabold tracking-[0.02em] whitespace-nowrap">
          <span className="text-[#D4AF37]">RE </span>
          <span className={`ml-1.5 md:ml-2 ${theme === "dark" ? "text-white" : "text-[#0F172A]"}`}>OneStop</span>
          <span className="text-[#D4AF37]">Page</span>
        </div>
    </Link>
  );
};
