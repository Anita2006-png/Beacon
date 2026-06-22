import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Alert — always rendered with an icon + text label so meaning is never
 * carried by colour alone (BUILD_SPEC §10.2). Pass a lucide icon as the first
 * child.
 */
const alertVariants = cva(
  "relative w-full rounded-[var(--radius)] border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:size-5 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-card text-foreground border-border",
        info: "border-info/40 bg-info/10 text-foreground [&>svg]:text-info",
        safe: "border-safe/40 bg-safe/10 text-foreground [&>svg]:text-safe",
        caution:
          "border-caution/40 bg-caution/10 text-foreground [&>svg]:text-caution",
        critical:
          "border-critical/50 bg-critical/10 text-foreground [&>svg]:text-critical",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
