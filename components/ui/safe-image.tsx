'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Building2 } from 'lucide-react';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  showIconFallbackOnFailure?: boolean;
}

export const DEFAULT_PLACEHOLDER = '/images/brewery-placeholder.svg';

export function isValidImageSrc(src?: string | null): boolean {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  // Check for valid absolute http/https URLs or relative local paths starting with /
  if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) {
    return true;
  }
  return false;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_PLACEHOLDER,
  showIconFallbackOnFailure = false,
  className = '',
  onError,
  ...rest
}: SafeImageProps) {
  const [prevSrc, setPrevSrc] = useState<string | null | undefined>(src);
  const [imgSrc, setImgSrc] = useState<string>(() => {
    return isValidImageSrc(src) ? (src as string).trim() : fallbackSrc;
  });
  const [hasError, setHasError] = useState<boolean>(!isValidImageSrc(src));

  if (src !== prevSrc) {
    setPrevSrc(src);
    if (isValidImageSrc(src)) {
      setImgSrc((src as string).trim());
      setHasError(false);
    } else {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
    if (onError) {
      onError(e);
    }
  };

  // If even fallback fails or explicitly requested, show styled UI container
  if (hasError && (imgSrc === fallbackSrc && showIconFallbackOnFailure)) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400 p-4 text-center ${className}`}
        aria-label={alt}
      >
        <Building2 className="w-8 h-8 opacity-40 mb-1" />
        <span className="text-xs font-semibold text-zinc-500 line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
