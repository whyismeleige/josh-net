import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

interface TimerProps {
  variant: string;
  timeLeft: number;
}

const alertVariants = cva(
  "relative w-full rounded-lg bg-card border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        success:
          "bg-chart-3 border-chart-3 text-card [&>svg]:text-card",
        error:
          "bg-destructive border-destructive text-destructive-foreground [&>svg]:text-destructive-foreground",
        warning:
          "bg-chart-4 border-chart-4 text-card [&>svg]:text-card",
        message:
          "bg-primary border-primary text-primary-foreground [&>svg]:text-primary-foreground",
        announcement:
          "bg-accent border-accent text-accent-foreground [&>svg]:text-accent-foreground",
        info: "bg-secondary border-secondary text-secondary-foreground [&>svg]:text-secondary-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-bold text-l tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

const AlertTimer: React.FC<TimerProps> = ({ variant, timeLeft }) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30">
      <div
        className={cn(
          "h-full transition-all duration-100 ease-linear",
          variant === "success" && "bg-chart-3",
          variant === "warning" && "bg-chart-4",
          variant === "error" && "bg-destructive",
          variant === "message" && "bg-primary",
          variant === "announcement" && "bg-accent",
          variant === "info" && "bg-muted-foreground",
          !variant && "bg-muted-foreground"
        )}
        style={{
          width: `${timeLeft}%`,
        }}
      />
    </div>
  );
};

export { Alert, AlertTitle, AlertDescription, AlertTimer };
