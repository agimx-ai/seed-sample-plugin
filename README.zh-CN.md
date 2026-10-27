# Seed 示例插件

[English](README.md)

一个可以直接运行的 MotusAI Seed 插件工程，演示 SDK 设置控件、前后端调用、带冲突检测的偏好保存，以及中英文翻译。

工程从 npm 安装 `@motus-ai/seed-sdk`，无需下载客户端源码、编译本地 SDK 或全局安装 CLI。

## 环境要求

- Node.js 24 或更新版本，以及 npm。建议使用 Node.js 24 LTS；`.nvmrc` 记录了这一主版本。
- 运行插件需要 MotusAI Seed 0.3.11 或更新版本。本示例固定使用 SDK 0.3.11。

**在客户端中联调需要先到 Seed「插件设置」中开启「插件开发模式」。** 客户端版本必须包含这个开关；仅安装 SDK 不能让旧版安装包获得该功能。构建和测试本工程不需要客户端源码，也不需要客户端正在运行。开关默认关闭；关闭后恢复仍获授权的正式插件，并保留插件数据。

源码启动与正式安装版共用这个开关和同一套插件加载逻辑；从源码启动客户端也不会自动启用插件开发。

## 开始开发

通过 GitHub 模板创建自己的仓库，或把工程文件复制到新目录。在自己的工程根目录执行：

```sh
npm install
npm run check
```

`check` 依次执行格式检查、TypeScript 检查、后端测试和插件构建。之后的全新安装和 CI 可以使用随仓库提交的锁文件执行 `npm ci`。以上步骤不需要客户端源码，也不需要客户端正在运行。

需要在客户端中联调时，打开兼容的 Seed 客户端，在「插件设置」中开启「插件开发模式」，再执行：

```sh
npm run dev
```

在 Seed 中打开「示例插件」，填写显示名称，点击「保存」，再点击「查看问候」。修改 `src/main.ts` 或翻译文件可以体验自动重建。同步成功不代表客户端已加载；请同时查看插件页面和 Seed 的活动记录、错误信息。

CLI 同步到当前用户的开发插件目录：

| 平台    | 目录                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------- |
| Windows | `%APPDATA%/MotusAI Seed/plugins/development/com.example.seed.sample`                              |
| macOS   | `~/Library/Application Support/MotusAI Seed/plugins/development/com.example.seed.sample`          |
| Linux   | `$XDG_CONFIG_HOME/MotusAI Seed/plugins/development/com.example.seed.sample`，默认基于 `~/.config` |

只想验证同步、不接触真实 Seed 配置时，可以指定隔离目录：

```sh
npm run dev -- --directory "隔离测试目录/development"
```

这个参数只改变 CLI 的输出位置，不会让客户端自动监听指定目录。按 Ctrl+C 停止后，CLI 会移除属于本次监听的开发产物。重建失败会保留上一次有效产物。

## 改成自己的插件

1. 把 `package.json` 和 `manifest.json` 中的 `com.example.seed.sample` 改为自己的插件 ID。两个文件的 ID 和版本保持一致。
2. 在 `manifest.json` 中填写作者，并修改两个 `locales/` 文件中的名称和介绍。
3. 在 `src/main.ts` 和 `src/service.ts` 中编写自己的功能。
4. 同步修改 `docs/plugin/` 下的两份用户介绍。构建时它们会成为插件内的 `README.md` 和 `README.zh-CN.md`；本开发说明不会随插件分发。
5. 根据实际使用的 SDK 接口维护 `minAppVersion`，新增依赖在本工程自己的 `package.json` 中声明。

修改插件 ID 会创建新的插件身份和数据空间。同 ID 的开发构建沿用该插件已有的偏好；需要时使用隔离测试配置。

## 工程结构

```text
src/main.ts               设置页和前端生命周期
src/service.ts            私有后端方法和偏好存储
src/preferences.ts        共享数据类型与校验
locales/                  中英文文案
docs/plugin/              随插件分发的用户介绍
tests/service.test.ts     基于 SDK 后端测试环境的测试
manifest.json             插件身份和最低客户端版本
build.mjs                 使用公开 SDK 构建
.github/workflows/check.yml
```

示例后端采用默认的 `sandboxed-web` 运行环境，不申请额外系统权限，也不接入外部服务。前端不得导入后端实现或 Node.js 模块。

## 常用命令

| 命令                   | 用途                                                           |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | 构建、同步并监听源码变化                                       |
| `npm run typecheck`    | 检查 TypeScript，不输出文件                                    |
| `npm run format`       | 格式化源码、JSON、Markdown 和 Workflow                         |
| `npm run format:check` | 检查格式，不修改文件                                           |
| `npm test`             | 验证偏好持久化、冲突、输入校验和生命周期                       |
| `npm run build`        | 在 `dist/` 生成 `main.js`、Manifest、样式和声明资源            |
| `npm run check`        | 执行格式检查、类型检查、测试和构建                             |
| `npm run pack`         | 构建并在 `artifacts/` 生成 ZIP 格式的 `.seedpkg`；不安装或发布 |

CI 在 Windows、macOS 和 Linux 上执行安装和 `check`，不会安装插件、生成安装包或发布版本。

如果 Windows 提示找不到 `seed-plugin` 或 `tsc`，先确认 Node.js 版本，再执行 `npm ci --include=dev --include=optional --bin-links=true`。不要跨操作系统复制 `node_modules`。

## 参考资料

- [npm 上的 Seed SDK](https://www.npmjs.com/package/@motus-ai/seed-sdk)
- [插件开发文档](https://motusseed.com/docs/plugins)

本工程使用 [MIT 许可证](LICENSE)。
