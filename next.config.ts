import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // Add other remote patterns if you host images on CDNs like Imgur, Cloudinary, etc.
      // For example, if you were to use a publicly hosted version of the logo:
      // {
      //   protocol: 'https',
      //   hostname: 'i.imgur.com', 
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;
