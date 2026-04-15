// Central configuration for MetroImpact AI
// In production (Vercel), set VITE_API_URL env var to your Render backend URL
// In local dev, it defaults to '' (same-origin, served by FastAPI on port 8000)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const METRO_COLORS = {
  primary: '#9b5de5',
  secondary: '#00bbf9',
  accent: '#f15bb5',
  success: '#00f5d4',
};
