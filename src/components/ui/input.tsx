import * as React from "react";
import { Eye, EyeOff, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  className?: string;
  icon?: LucideIcon;
  showPasswordToggle?: boolean;
}

function Input({
  className,
  value,
  type,
  icon: IconComponent,
  showPasswordToggle = false,
  ...props
}: InputProps) {
  const [showPassword, toggleShowPassword] = React.useState(false);
  const isPasswordType = type === "password";
  const shouldShowToggle = isPasswordType && showPasswordToggle;
  const hasLeftIcon = !!IconComponent;

  const inputType = isPasswordType && showPassword ? "text" : type;

  return (
    <div className={shouldShowToggle || IconComponent ? "relative" : undefined}>
      {IconComponent && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <IconComponent className="h-4 w-4" />
        </div>
      )}
      <input
        type={inputType}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          hasLeftIcon && shouldShowToggle
            ? "px-10"
            : hasLeftIcon
            ? "pl-10 pr-3"
            : shouldShowToggle
            ? "pl-3 pr-10"
            : "px-3",
          className
        )}
        value={value}
        {...props}
      />
      {shouldShowToggle && (
        <button
          type="button"
          onClick={() => toggleShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}

export { Input };
