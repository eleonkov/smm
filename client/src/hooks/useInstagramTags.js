import { useEffect, useState } from "react";
import { STOP_WORDS, TAGS_REGEXP } from "../constants";
import { useSharedData } from "./useSharedData";

export const useInstagramTags = () => {
  const sharedData = useSharedData();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const tags = sharedData.reduce((acc, { message }) => {
      const tgs = message.match(/(^|\s)(#[a-z\d-]+)/gi) ?? [];

      const whiteListWithTags = tgs
        .map((t) => t.trim().toLocaleLowerCase())
        .filter((t) => !STOP_WORDS.includes(t))
        // .filter((t) => TAGS_REGEXP.test(t))
        .filter((t) => t.length < 12 && t.length > 2);

      return tgs ? [...new Set([...acc, ...whiteListWithTags])] : acc;
    }, []);

    setTags(tags);
  }, [sharedData]);

  return tags;
};
