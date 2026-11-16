///lib/asset-url.ts
export const ASSETS_BASE = (process.env.NEXT_PUBLIC_ASSETS_URL || "").replace(/\/+$/, "");
const ORIGIN_BASE = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

export const resolveImg = (u?: string | null, placeholder = "/api/placeholder/60/60") => {
  if (!u) return placeholder;
  if (/^https?:\/\//i.test(u)) return u; // absolute URL
  
  const cleaned = u.replace(/^\/+/, "").replace(/^public\//, "");
  
  if (cleaned.startsWith("uploads/")) {
    // Path under uploads -> join with origin
    return ORIGIN_BASE ? `${ORIGIN_BASE}/${cleaned}` : `/${cleaned}`;
  }
  
  // Treat as key under assets base
  return ASSETS_BASE ? `${ASSETS_BASE}/${cleaned}` : `/${cleaned}`;
};

export const getAvatarUrl = (avatarUrl?: string | null) => {
  return resolveImg(avatarUrl, `https://ui-avatars.com/api/?name=${encodeURIComponent("User")}&background=random`);
};