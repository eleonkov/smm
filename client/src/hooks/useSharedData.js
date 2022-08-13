import { useMemo } from "react";

export const useSharedData = () =>
  useMemo(
    () =>
      Array.from(window._sharedData)
        .filter((item) => item?.comments && item?.comments >= 100)
        .sort((a, b) => b.comments - a.comments),
    []
  );
