/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
    },
    images: {
        domains: ['localhost'],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/login',
                permanent: false,
            },
        ];
    },
}

module.exports = nextConfig 