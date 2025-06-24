import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-muted bg-[linear-gradient(110deg,hsl(var(--muted))_8%,hsl(var(--muted-foreground)/0.2)_18%,hsl(var(--muted))_33%)] bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
