/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        // هون كتبنا الـ Glob Patterns كـ Strings نظيفة ومستحيل تضرب الـ Schema
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/pagefile.sys',
          '**/hiberfil.sys',
          '**/swapfile.sys',
          '**/DumpStack.log.tmp'
        ]
      };
    }
    return config;
  },
  experimental: {
    outputFileTracingIncludes: {
      '/**/*': ['./prisma/dev.db']
    }
  }
};

module.exports = nextConfig;