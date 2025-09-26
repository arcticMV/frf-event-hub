import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Exclude functions directory from Next.js build
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: "./tsconfig.json",
  },
  // Ensure functions directory is not processed
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/functions/,
      })
    );

    // Also exclude functions from module resolution
    config.resolve.modules = config.resolve.modules.filter(
      (mod: string) => !mod.includes('functions')
    );

    return config;
  },
};

export default nextConfig;