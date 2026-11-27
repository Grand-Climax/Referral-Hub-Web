import { createRequire } from 'module';

var require = createRequire(import.meta.url);
var module = { exports: {} };

// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
