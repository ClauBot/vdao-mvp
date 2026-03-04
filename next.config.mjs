import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emptyModule = path.resolve(__dirname, 'src/lib/empty-module.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Stub optional wagmi connector peer dependencies we don't need
    config.resolve.alias = {
      ...config.resolve.alias,
      'porto/internal': emptyModule,
      '@metamask/sdk': emptyModule,
      '@safe-global/safe-apps-sdk': emptyModule,
      '@safe-global/safe-apps-provider': emptyModule,
    };

    // Node.js built-ins not available in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      dns: false,
    };

    return config;
  },
};

export default nextConfig;
