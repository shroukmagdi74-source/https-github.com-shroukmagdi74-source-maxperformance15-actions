import { featureCopyPart1 } from "./featureCopyPart1";
import { featureCopyPart2 } from "./featureCopyPart2";
import { featureCopyPart3 } from "./featureCopyPart3";
import { featureCopyPart4 } from "./featureCopyPart4";
import { featureCopyPart5 } from "./featureCopyPart5";
import type { FeatureCatalogEntry } from "./types";

export const FEATURE_COPY: Record<string, FeatureCatalogEntry> = {
  ...featureCopyPart1,
  ...featureCopyPart2,
  ...featureCopyPart3,
  ...featureCopyPart4,
  ...featureCopyPart5,
};
