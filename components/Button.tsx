import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================
// BUTTON VARIANTS & SIZES
// ==========================================

const variantStyles = {
  primary:
    "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 hover:-translate-y-0.5 border-transparent",
  secondary:
    "bg-gray-900 text-white shadow-md hover:bg-gray-800 hover:-translate-y-0.5 border-transparent",
  outline:
    "bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent",
  danger:
    "bg-red-600 text-white shadow-md hover:bg-red-700 hover:-translate-y-0.5 border-transparent",
};

const sizeStyles = {
  sm: "h-9 px-3.5 text-xs rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-13 px-7 text-base rounded-xl gap-2.5",
  icon: "h-10 w-10 rounded-xl", // For icon-only buttons
};

type Variant = keyof typeof variantStyles;
type Size = keyof typeof sizeStyles;

// ==========================================
// COMPONENT PROPS
// ==========================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

// ==========================================
// BUTTON COMPONENT
// ==========================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none active:scale-[0.98]",
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          // Custom classes
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {/* Left Icon */}
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            
            {/* Button Text */}
            <span className={cn(isLoading && "opacity-0 absolute")}>
              {children}
            </span>
            
            {/* Right Icon */}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;