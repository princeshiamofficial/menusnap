import type { ComponentPropsWithoutRef, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowRightIcon } from "@/components/landing/icons";

/* ------------------------------------------------------------------ */
/* Container                                                           */
/* ------------------------------------------------------------------ */

export function Container({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("container-site", className)} {...props} />;
}

/* ------------------------------------------------------------------ */
/* Button — polymorphic (anchor or button)                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "dark-ghost" | "night";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white shadow-pop hover:bg-accent-deep active:scale-[0.98]",
  secondary:
    "border border-line bg-white text-ink shadow-card hover:border-ink/20 hover:shadow-lift",
  ghost: "text-ink hover:bg-ink/5",
  dark: "bg-white text-ink shadow-card hover:bg-cream",
  "dark-ghost": "border border-white/20 text-white hover:bg-white/10",
  night: "bg-night text-white shadow-card hover:bg-black hover:shadow-lift",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-[15px] sm:h-[52px] sm:px-7 sm:text-base",
};

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  withArrow?: boolean;
  href?: string;
  children: ReactNode;
  className?: string;
  /** Widened so the same Button works as both <a> and <button>. */
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
} & Pick<
  ComponentPropsWithoutRef<"button">,
  "type" | "disabled" | "aria-label" | "aria-expanded" | "aria-controls"
>;

export function Button({
  variant = "primary",
  size = "md",
  withArrow = false,
  href,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "group/btn inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  const content = (
    <>
      <span className="inline-flex items-center gap-2">{children}</span>
      {withArrow && (
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Section heading                                                     */
/* ------------------------------------------------------------------ */

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  dark?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]",
            dark
              ? "border-white/15 bg-white/5 text-accent"
              : "border-line bg-white text-accent",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "text-balance text-[clamp(1.9rem,4.2vw,3.25rem)] font-extrabold leading-[1.12] tracking-[-0.02em]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-balance max-w-2xl text-[clamp(1rem,1.6vw,1.125rem)] leading-relaxed",
            dark ? "text-white/60" : "text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}