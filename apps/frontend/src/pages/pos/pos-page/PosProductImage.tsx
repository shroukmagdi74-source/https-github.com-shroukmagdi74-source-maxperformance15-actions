import React, { useState, useEffect, useMemo } from "react";
import {
  buildOptimizedUploadImageUrl,
  buildResponsiveUploadImage,
} from "../../../utils/imageUrl";
import { PosProductImageProps } from "./types";

export const PosProductImage: React.FC<PosProductImageProps> = ({
  candidates,
  alt,
  className,
  fallback,
  requestedWidth,
  responsiveWidths,
  responsiveSizes,
  imageQuality = 72,
  loading = "lazy",
  fetchPriority = "low",
}) => {
  const normalizedCandidates = useMemo(
    () =>
      candidates
        .map((candidate) => candidate.trim())
        .filter(Boolean),
    [candidates],
  );
  const candidatesKey = normalizedCandidates.join("|");
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [useOriginalCandidate, setUseOriginalCandidate] = useState(false);

  useEffect(() => {
    setCandidateIndex(0);
    setUseOriginalCandidate(false);
  }, [candidatesKey]);

  useEffect(() => {
    setUseOriginalCandidate(false);
  }, [candidateIndex]);

  const activeCandidate = normalizedCandidates[candidateIndex];
  const imageProps = useMemo(() => {
    if (!activeCandidate) {
      return { src: "", srcSet: undefined, sizes: undefined };
    }

    if (useOriginalCandidate) {
      return { src: activeCandidate, srcSet: undefined, sizes: undefined };
    }

    if (responsiveWidths?.length && responsiveSizes) {
      return buildResponsiveUploadImage(activeCandidate, {
        widths: responsiveWidths,
        fallbackWidth: requestedWidth,
        sizes: responsiveSizes,
        quality: imageQuality,
      });
    }

    return {
      src: buildOptimizedUploadImageUrl(activeCandidate, {
        width: requestedWidth,
        quality: imageQuality,
      }),
      srcSet: undefined,
      sizes: undefined,
    };
  }, [
    activeCandidate,
    imageQuality,
    requestedWidth,
    responsiveSizes,
    responsiveWidths,
    useOriginalCandidate,
  ]);

  if (!activeCandidate) {
    return <>{fallback}</>;
  }

  const priorityProps = fetchPriority ? { fetchpriority: fetchPriority } : {};

  return (
    <img
      {...priorityProps}
      src={imageProps.src}
      srcSet={imageProps.srcSet}
      sizes={imageProps.sizes}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      onError={() => {
        if (!useOriginalCandidate && imageProps.src !== activeCandidate) {
          setUseOriginalCandidate(true);
          return;
        }

        setUseOriginalCandidate(false);
        setCandidateIndex((currentIndex) => currentIndex + 1);
      }}
    />
  );
};
