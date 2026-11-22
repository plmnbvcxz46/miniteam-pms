/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-declaration-strict-value"],
  // 阶段 4 逐模块迁移清理清单：每迁完一个模块，即从下方移出对应路径
  ignoreFiles: [
    "dist/**",
    "src/styles/index.css",
    "src/styles/legacy.css",
    "src/styles/typography/roles.css",
    "src/shared/components/TaskBar.css",
    "src/shared/components/SearchDropdown.css",
    "src/pages/reports/css/**/*.css",
    "src/pages/members/css/**/*.css",
    "src/pages/documents/css/**/*.css",
    "src/pages/timeline/css/**/*.css",
    "src/pages/overview/css/**/*.css",
    "src/pages/task/css/**/*.css",
    "src/pages/board/css/**/*.css",
    "src/pages/collab/css/**/*.css",
  ],
  rules: {
    // 兼容 DESIGN.md 中 rgba(..., 0.12) 与现代 rgb(... / 12%) 两种写法
    "color-function-notation": null,
    "color-function-alias-notation": null,
    "alpha-value-notation": null,
    // 允许 SVG/关键字 currentColor
    "value-keyword-case": ["lower", { camelCaseSvgKeywords: true }],
    // 允许 CSS Modules 驼峰或短横线类名
    "selector-class-pattern": "^[a-z][a-zA-Z0-9-]*$",
    // 允许文件内 :root 或组件变量自由空行分组
    "custom-property-empty-line-before": null,
    // 统一使用字符串形式的 @import "./..." 与 6 位完整 hex 色值（与 DESIGN.md 及 Prettier 对齐）
    "import-notation": "string",
    "color-hex-length": "long",
  },
  overrides: [
    // 1. Token 定义层：仅允许 :root（及预留 [data-theme="dark"]）和 --* 自定义属性，禁止普通样式规则，放行原始色值/数值
    {
      files: ["src/styles/tokens/*.css"],
      rules: {
        "property-allowed-list": [/^--/],
        "selector-disallowed-list": [/^(?!:root$|\[data-theme="dark"\]$)/],
        "scale-unlimited/declaration-strict-value": null,
        "declaration-property-value-disallowed-list": null,
      },
    },
    // 1b. Level 3 组件色文件额外禁止直接引用 Level 1 原始色板（仅允许引用 Level 2 语义色）
    {
      files: ["src/styles/tokens/components.css"],
      rules: {
        "declaration-property-value-disallowed-list": {
          "/.*/": [/var\(--(?:gray|signal)-/],
        },
      },
    },
    // 2. 新规范样式层（base.css、UI/Patterns/Features CSS Modules）：强制 Token + 禁止引用原始色板
    {
      files: [
        "src/styles/base.css",
        "src/components/**/*.module.css",
        "src/features/**/*.module.css",
        "src/dev/**/*.module.css",
      ],
      rules: {
        // 严禁直接引用 Level 1 原始色板 --gray-* / --signal-*
        "declaration-property-value-disallowed-list": {
          "/.*/": [/var\(--(?:gray|signal)-/],
        },
        // 严禁硬编码颜色、间距、圆角、描边宽度、字号、字重、行高、阴影、动画时长、z-index
        "scale-unlimited/declaration-strict-value": [
          [
            "/color$/",
            "background-color",
            "fill",
            "stroke",
            "/^margin/",
            "/^padding/",
            "gap",
            "row-gap",
            "column-gap",
            "/^border.*radius$/",
            "/^border.*width$/",
            "outline-width",
            "font-size",
            "font-weight",
            "line-height",
            "box-shadow",
            "transition-duration",
            "animation-duration",
            "z-index",
          ],
          {
            expandShorthand: true,
            recurseLonghand: true,
            ignoreValues: {
              "/color$/": ["transparent", "currentColor", "inherit", "none"],
              "background-color": ["transparent", "currentColor", "inherit"],
              fill: ["transparent", "currentColor", "none", "inherit"],
              stroke: ["transparent", "currentColor", "none", "inherit"],
              "/^margin/": ["0", "auto", "inherit"],
              "/^padding/": ["0", "inherit"],
              gap: ["0"],
              "row-gap": ["0"],
              "column-gap": ["0"],
              "/^border.*radius$/": ["0", "inherit"],
              "/^border.*width$/": ["0", "none", "inherit"],
              "outline-width": ["0", "none", "inherit"],
              "font-size": ["inherit"],
              "font-weight": ["inherit"],
              "line-height": ["inherit"],
              "box-shadow": ["none", "inherit"],
              "transition-duration": ["0s", "0ms"],
              "animation-duration": ["0s", "0ms"],
              "z-index": ["auto"],
            },
          },
        ],
      },
    },
  ],
};
