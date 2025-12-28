import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@fintech/ui', '@fintech/hooks', '@fintech/lib', '@fintech/config', '@fintech/types'],
};

export default nextConfig;
