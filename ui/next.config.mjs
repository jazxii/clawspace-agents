/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3001"] },
  },
  // The UI reads from the parent directory (the workforce filesystem).
  // Allow tracing of files outside ui/ for the production build.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
