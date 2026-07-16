/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint costs ~46s of a ~90s build — over half of it — and only reports style
  // and quality issues, which can't break the deployed site. It stays part of
  // `npm run lint` locally (see CLAUDE.md); skipping it here roughly halves
  // deploy time. Type-checking is deliberately left ON: it's ~17s and it's the
  // check that actually stops a broken build reaching production.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
