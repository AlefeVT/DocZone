/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/,
      use: 'html-loader',
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '', // If applicable, add the port number here
        pathname: '/**', // Allow all paths
      },
      {
        protocol: 'https',
        hostname: 'avtdoc.s3.us-east-1.amazonaws.com', // Adicionando o domínio da S3
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
