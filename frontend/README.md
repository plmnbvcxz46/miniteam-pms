# 前端

React 19 + TypeScript + Vite + React Router，pnpm。

```bash
pnpm install
pnpm dev
```

## 目录

```
prototype/        原型 global.html + global.js，只作参考，不参与构建
src/
  components/     通用零件（Drawer：遮罩 + 右侧板子）
  layouts/        Shell：左侧导航、masthead、<Outlet />、浮层
  pages/          有地址的页面，一页一个文件夹
  overlays/       盖在页面上的浮层（settings、task 表单）
  auth/           登录态，useAuth()
  access/         能进哪些项目、有什么权限、任务能不能看和改，useAccess()
  issue/          正在看哪一期，useIssue()；过去的期只读
  config/         系统参数
  data/           假数据；哪些值是前端替身见 AGENTS.md
  styles/         全局样式
```

## 进度

- [X] 路由、Shell
- [X] 各页面 HTML 骨架
- [X] 设置抽屉：7 个分区组件，Shell 管开关（系统管理 / 个人按钮打开，关闭按钮 / 遮罩关闭）
- [X] 填空容器：原型里由 `global.js` 用 `innerHTML` 生成的内容，TSX 里还是空的
- [X] 拆 CSS
- [ ] 交互
- [ ] 表单抽屉、动效、空 / 加载 / 出错状态

| 页面                   | 骨架 | 填数据 | 拆 CSS | 交互              |
| ---------------------- | ---- | ------ | ------ | ----------------- |
| 文档 documents         | ✓   | ✓     | ✓     |                   |
| 成员与权限 members     | ✓   | ✓     | ✓     |                   |
| 统计报表 reports       | ✓   | ✓     | ✓     |                   |
| 团队协作 collab        | ✓   | ✓     | ✓     |                   |
| 概览 overview          | ✓   | ✓     | ✓     |                   |
| 任务详情 board/task    | ✓   | ✓     | ✓     | 状态、跳转、编辑 ✓ |
| 时间线 timeline        | ✓   | ✓     | ✓     | 缩放、跳转 ✓      |
| 看板 board             | ✓   | ✓     | ✓     | 拖拽、筛选、新建 ✓ |
| 设置 overlays/settings | ✓   | ✓     | ✓     | 分区切换、保存 ✓  |

表按建议顺序排列，先易后难。

## 每页做法

一次只做一个页面，做完再做下一个。

1. **填数据**：从 `global.js` 找出这页的数据，写成 `src/data/` 里的假数据；空容器用 `.map` 渲染
2. **拆 CSS**：把这页专属的样式从 `index.css` 剪到同目录的 `XxxPage.css` 并 import；class 名不改
3. **交互**：找出这页最少需要的 state，加事件
4. **对照**：和 `prototype/global.html` 并排打开，确认一致

## global.js 怎么拆

| 内容                                                                       | 处理                |
| -------------------------------------------------------------------------- | ------------------- |
| 数据（任务、成员、文档…）                                                 | `src/data/`       |
| 拼 HTML（`innerHTML`）                                                   | 改成 JSX + `.map` |
| 点击、切换、拖拽                                                           | state + 事件        |
| 进场擦除、连线逐笔画出                                                     | 最后统一做          |
| 演示开关、`scheme` 方案切换、`view-system` / `sys-host` / `ss-src` | 丢弃                |

## CSS 拆分

- 全局生效，只分文件，不改 class 名，不用 CSS Modules / Tailwind
- 拆完页面外观不变即正确

```
styles/tokens.css    变量（--ink、--paper…）
styles/base.css      纸纹、字体、按钮、双线等共用
layouts/Shell.css    导航、masthead
components/Drawer.css
pages/*/XxxPage.css
```

## 约定

- 遮罩和板子只写在 `components/Drawer.tsx`，其他文件不直接写 `ov-bd` / `ov`
- 浮层的开关 state 放 `Shell.tsx`；变灰靠 shell 加 `dim` class
- 假数据字段按后端接口返回的格式写
- 页面先只做正常状态

## 待定

- 无样式组件库：Base UI 或 Radix（加交互前定）
- 表单抽屉：新建项目还没做
- 全部页面填完后删除 `prototype/`
