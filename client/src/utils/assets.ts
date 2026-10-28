// Dev: relative paths work through the Vite proxy. Prod: set VITE_ASSET_BASE to your API/CDN origin.
const BASE = (import.meta.env.VITE_ASSET_BASE as string | undefined) ?? '';
export const assetUrl = (u?: string | null) => (!u ? '' : /^https?:\/\//.test(u) ? u : `${BASE}${u}`);