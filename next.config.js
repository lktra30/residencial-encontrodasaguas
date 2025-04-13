/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Garantir que o Next.js permita importar de '/src'
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  // Configuração de imagens para permitir domínios do Supabase
  images: {
    domains: [
      'erbehnwhtpfjyurvylvz.supabase.co'
    ],
  },
};

module.exports = nextConfig; 