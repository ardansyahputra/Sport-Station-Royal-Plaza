/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  distDir: process.env.DIST_DIR || '.next',

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    // Membuka izin akses domain agar link gambar Nike milikmu bisa tampil
    domains: [
      'images.unsplash.com', 
      'lh3.googleusercontent.com', 
      'drive.google.com',
      'storage.googleapis.com',
      'share.google',
      'static.nike.com' // Domain utama dari link Nike kamu
    ],
    minimumCacheTTL: 60,
  }
};

export default nextConfig;