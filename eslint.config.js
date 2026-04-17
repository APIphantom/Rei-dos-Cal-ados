const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");

module.exports = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["eslint.config.js", "tailwind.config.ts", "postcss.config.js", "next.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

