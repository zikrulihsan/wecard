import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores(["dist/**", "node_modules/**"]),
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "netlify/**/*.ts"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.flat.recommended.rules,
  },
]);
