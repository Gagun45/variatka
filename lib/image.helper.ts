export const getImageUrl = (imageKey?: string | null, version?: number) => {
  if (!imageKey) return "/default-poster.jpg";

  return `${process.env.NEXT_PUBLIC_CDN_URL}/${imageKey}?v=${version ?? 0}`;
};
