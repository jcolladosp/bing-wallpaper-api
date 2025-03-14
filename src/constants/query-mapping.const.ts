/*
  This file contains the query params mapping from the original query params to the ones used by Bing.
*/

export const queryMapping: Record<string, string> = {
  height: "h",
  width: "w",
  quality: "qlt",
};

export const transformQueryParams = (key: string): string => {
  return queryMapping[key] || key;
};
