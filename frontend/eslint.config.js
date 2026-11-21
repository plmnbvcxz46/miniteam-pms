import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

const RADIX_SUBPACKAGE = {
  group: ["@radix-ui/*"],
  message:
    '请统一从单包 "radix-ui" 具名导入，禁止使用独立 @radix-ui/* 分包。',
};

const NO_DATA_LAYER = {
  regex: "(?:^|/)(?:services|api)(?:/|$)",
  message:
    "UI/页面组件内禁止直接导入 services/* 或 api/*，请通过 hooks / stores 层调用。",
};

const NO_BUSINESS_LAYERS = {
  regex:
    "(?:^|/)(?:features|services|stores|api|state|pages|layout|overlays)(?:/|$)",
  message:
    "components/ui 与 components/patterns 禁止依赖业务域（features/services/stores/api/state/pages/layout/overlays）。",
};

const NO_PATTERNS_IN_UI = {
  regex: "(?:^|/)(?:components/)?patterns(?:/|$)",
  message:
    "严格单向依赖 features → patterns → ui：components/ui 禁止引用 components/patterns。",
};

const NO_EXPLICIT_FEATURES = {
  regex: "(?:^|/)features(?:/|$)",
  message:
    "各 feature 之间禁止互相引用，共享内容请上收至 components/patterns、shared 或 stores。",
};

/** 拦截在 src/features/<domain> 内 depth 层子目录中通过相对路径跨到兄弟 feature */
const crossFeatureAtDepth = (depth) => ({
  regex: `^${"\\.\\./".repeat(depth + 1)}(?!\\.\\./)`,
  message:
    "各 feature 之间禁止通过相对路径跨目录互引，仅允许引用当前 feature 内部或公共层。",
});

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-restricted-imports": ["error", { patterns: [RADIX_SUBPACKAGE] }],
    },
  },
  // components 兜底：禁止任何业务域与数据层依赖
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [RADIX_SUBPACKAGE, NO_BUSINESS_LAYERS] },
      ],
    },
  },
  // components/ui：额外禁止引用 components/patterns
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [RADIX_SUBPACKAGE, NO_PATTERNS_IN_UI, NO_BUSINESS_LAYERS] },
      ],
    },
  },
  // components/patterns：允许引用 ui，禁止业务域与数据层
  {
    files: ["src/components/patterns/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [RADIX_SUBPACKAGE, NO_BUSINESS_LAYERS] },
      ],
    },
  },
  // features 兜底（覆盖超过 4 层嵌套的极端情况）
  {
    files: ["src/features/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [RADIX_SUBPACKAGE, NO_EXPLICIT_FEATURES] },
      ],
    },
  },
  {
    files: ["src/features/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [RADIX_SUBPACKAGE, NO_EXPLICIT_FEATURES, NO_DATA_LAYER] },
      ],
    },
  },
  // features 精确深度 0..3 跨兄弟 feature 相对路径拦截（.ts 放行 services，.tsx 禁 services/api）
  ...[0, 1, 2, 3].flatMap((depth) => {
    const sub = depth === 0 ? "" : "*/".repeat(depth);
    const cross = crossFeatureAtDepth(depth);
    return [
      {
        files: [`src/features/*/${sub}*.ts`],
        rules: {
          "no-restricted-imports": [
            "error",
            { patterns: [RADIX_SUBPACKAGE, NO_EXPLICIT_FEATURES, cross] },
          ],
        },
      },
      {
        files: [`src/features/*/${sub}*.tsx`],
        rules: {
          "no-restricted-imports": [
            "error",
            {
              patterns: [
                RADIX_SUBPACKAGE,
                NO_EXPLICIT_FEATURES,
                cross,
                NO_DATA_LAYER,
              ],
            },
          ],
        },
      },
    ];
  }),
]);
