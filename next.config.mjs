// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          pathname: '/assets/images/**',
        },
      ],
    },
    webpack: (config) => {
      config.module.rules.push({
        test: /\.(wav|mp3)$/i,
        type: "asset/resource",
      });
  
      return config;
    },
  };
  
  export default nextConfig;