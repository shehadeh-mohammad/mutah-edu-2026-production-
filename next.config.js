/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  optimizeFonts: false,

  // output: 'standalone', // Disabled for native Next.js server routing

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
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
    // Bundle the pre-seeded SQLite db into the Next.js output trace
    // so it is copied into .next/standalone/prisma/ for the Render deployment
    outputFileTracingIncludes: {
      '/**/*': ['./prisma/dev.db', './prisma/schema.prisma']
    }
  }
};

module.exports = nextConfig;