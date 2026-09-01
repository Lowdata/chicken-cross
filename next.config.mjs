/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },

  experimental: {
    optimizePackageImports: ['lucide-react', '@rainbow-me/rainbowkit', 'viem', 'wagmi', 'three'],
  },

  transpilePackages: ['@rainbow-me/rainbowkit'],

  webpack: (config, { dev, isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      '@x402/evm/upto/client': false,
      '@x402/evm/exact/client': false,
      '@x402/core/client': false,
      '@x402/svm/exact/client': false,
      '@x402/evm': false,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
    };

    if (dev) {
      // Disable expensive source-maps in dev to save ~1GB+ RAM
      config.devtool = 'eval-cheap-module-source-map';
    }

    return config;
  },
};

export default nextConfig;
