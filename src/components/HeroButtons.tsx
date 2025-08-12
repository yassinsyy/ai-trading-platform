// src/components/HeroButtons.tsx
import React, { PropsWithChildren } from "react";

interface ButtonProps extends PropsWithChildren {
  onClick?: () => void;
  href?: string;
}

export function PrimaryButton({ children, onClick, href }: ButtonProps) {
  if (href) {
    return (
      <a
        href={href}
        className="bg-gradient-to-r from-[#00F5D4] to-[#09C1A3] text-black font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00F5D4] flex items-center justify-center w-full xs:w-auto min-h-[44px] text-base"
        aria-label={typeof children === "string" ? children : "Primary Action"}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className="bg-gradient-to-r from-[#00F5D4] to-[#09C1A3] text-black font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00F5D4] flex items-center justify-center w-full xs:w-auto min-h-[44px] text-base"
      onClick={onClick}
      aria-label={typeof children === "string" ? children : "Primary Action"}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, href }: ButtonProps) {
  if (href) {
    return (
      <a
        href={href}
        className="bg-transparent border-2 border-[#00F5D4] text-[#00F5D4] font-semibold py-4 px-8 rounded-xl hover:bg-[#00F5D4]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00F5D4] flex items-center justify-center w-full xs:w-auto min-h-[44px] text-base"
        aria-label={typeof children === "string" ? children : "Secondary Action"}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className="bg-transparent border-2 border-[#00F5D4] text-[#00F5D4] font-semibold py-4 px-8 rounded-xl hover:bg-[#00F5D4]/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00F5D4] flex items-center justify-center w-full xs:w-auto min-h-[44px] text-base"
      onClick={onClick}
      aria-label={typeof children === "string" ? children : "Secondary Action"}
    >
      {children}
    </button>
  );
} 