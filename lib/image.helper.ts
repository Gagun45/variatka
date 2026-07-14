export const getImageUrl = (imageKey?: string | null, version?: number) => {
  if (!imageKey) return "/default-poster-new.png";

  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");

  return `${publicUrl}/${imageKey}?v=${version ?? 0}`;
};
