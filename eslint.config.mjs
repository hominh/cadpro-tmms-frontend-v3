import nextConfig from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".next/**", ".next-cache/**", "out/**", "build/**", "dist/**", "coverage/**", "playwright-report/**", "test-results/**", "node_modules/**"],
  },
  ...nextConfig,
];

export default config;
