/* eslint-disable @next/next/no-img-element */
import { cn } from "@/utils/cn";

/**
 * Plain <img> rather than next/image: product thumbnails come from arbitrary
 * DummyJSON URLs and some are locally entered by the user, so there is nothing
 * to gain from the image optimizer and remote-pattern config here.
 */
export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      loading="lazy"
      className={cn("object-contain", className)}
    />
  );
}
