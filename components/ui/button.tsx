import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-pill bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        destructive:
          "rounded-pill bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        outline:
          "rounded-pill border-2 border-foreground bg-transparent text-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "rounded-pill bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "rounded-pill border-2 border-border/30 bg-transparent text-foreground hover:bg-muted aria-expanded:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-auto gap-1.5 px-[30px] py-[14px] has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
        xs: "h-auto gap-1 px-3 py-1.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-auto gap-1 px-4 py-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-auto gap-1.5 px-8 py-4 text-base",
        icon: "size-10 rounded-full p-0",
        "icon-xs": "size-6 rounded-full p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
