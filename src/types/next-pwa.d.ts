declare module 'next-pwa' {
    import { NextConfig } from 'next';

    interface PWAConfig {
        dest?: string;
        disable?: boolean;
        register?: boolean;
        scope?: string;
        sw?: string;
        skipWaiting?: boolean;
        runtimeCaching?: any[];
        buildExcludes?: Array<string | RegExp>;
        dynamicStartUrl?: boolean;
    }

    function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;

    export = withPWA;
} 