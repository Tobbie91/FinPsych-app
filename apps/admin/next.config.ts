import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@fintech/ui', '@fintech/hooks', '@fintech/lib', '@fintech/config', '@fintech/types'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
