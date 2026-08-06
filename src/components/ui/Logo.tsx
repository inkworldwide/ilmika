import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  isScrolled?: boolean;
  theme?: "light" | "dark";
  showText?: boolean;
}

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src="/logo.png" 
        alt="ILMIKA Logo" 
        className="w-full h-full object-contain" 
      />
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  className = "",
  theme = "light",
  showText = true,
}) => {
  return (
    <Link 
      href="/" 
      className={`group relative flex items-center shrink-0 my-auto mr-5 lg:mr-8 ${className}`}
      aria-label="ILMIKA Home"
    >
      {showText ? (
        <div className="h-[38px] sm:h-[42px] md:h-[45px] flex items-center shrink-0">
          <img 
            src="/logo-full.png" 
            alt="ILMIKA" 
            className="h-full w-auto object-contain max-h-full transition-transform duration-200 group-hover:scale-[1.02]" 
          />
        </div>
      ) : (
        <div className="h-[38px] sm:h-[42px] md:h-[45px] flex items-center shrink-0">
          <img 
            src="/logo.png" 
            alt="ILMIKA Mark" 
            className="h-full w-auto object-contain max-h-full transition-transform duration-200 group-hover:scale-[1.03]" 
          />
        </div>
      )}
    </Link>
  );
};
