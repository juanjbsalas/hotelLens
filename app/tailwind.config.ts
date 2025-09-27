import type { Config } from 'tailwindcss';


const config: Config = {
    // Project uses `src/app` and `src/components` — ensure Tailwind scans those files.
    content: [
        './src/**/*.{ts,tsx,js,jsx,html}',
        './app_unused/**/*.{ts,tsx,js,jsx,html}',
        './public/**/*.html',
    ],
    theme: { extend: {} },
    plugins: []
};
export default config;