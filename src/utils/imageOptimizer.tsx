import React from 'react';

// src/utils/imageOptimizer.tsx
/**
 * Returns an optimised <img> props object:
 * - Prefers WebP src when a webpSrc is provided
 * - Always sets loading="lazy" for below-the-fold images
 * - Adds width/height to avoid layout shift
 */
export interface OptimisedImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  eager?: boolean; // set true for LCP images (hero / above the fold)
}

export const optimisedImgProps = ({
  src,
  webpSrc,
  alt,
  width,
  height,
  className = '',
  eager = false,
}: OptimisedImageProps): React.ImgHTMLAttributes<HTMLImageElement> => ({
  src: webpSrc ?? src,
  alt,
  width,
  height,
  className,
  loading: eager ? 'eager' : 'lazy',
  decoding: 'async',
});

/**
 * Wraps an image in a <picture> element serving WebP first, PNG/JPG as fallback.
 * Use in JSX:
 *   <picture>
 *     {webpSource('/img/medicine.webp')}
 *     <img src="/img/medicine.png" alt="Medicine" loading="lazy" />
 *   </picture>
 */
export const webpSource = (webpSrc: string): React.ReactElement => (
  <source srcSet={webpSrc} type="image/webp" />
);
