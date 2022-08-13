import { useCallback, useState } from "react";
import _ from "lodash";

import { useInstagramTags } from "./useInstagramTags";

export const useSharedContent = () => {
  const [sharedContent, setSharedContent] = useState([]);

  const tags = useInstagramTags();

  console.log("tags", tags);

  const addContent = useCallback(
    (newContent) => {
      const tmp = sharedContent.filter((item) => item.id !== newContent.id);
      setSharedContent([
        ...tmp,
        { ...newContent, tags: _.sampleSize(tags, _.random(18, 25)) },
      ]);
    },
    [tags, sharedContent]
  );

  const removeContent = useCallback(
    (id) => {
      setSharedContent(sharedContent.filter((item) => item.id !== id));
    },
    [sharedContent]
  );

  const isContentExists = useCallback(
    (id) => sharedContent.some((item) => item.id === id),
    [sharedContent]
  );

  return {
    sharedContent,
    addContent,
    removeContent,
    isContentExists,
  };
};
