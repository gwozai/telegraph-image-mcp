# telegraph-image-mcp

[![npm version](https://img.shields.io/npm/v/telegraph-image-mcp)](https://www.npmjs.com/package/telegraph-image-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

上传图片/视频到 [Telegraph-Image](https://github.com/cf-pages/Telegraph-Image) 图床的 MCP Server。

让 Cursor、Claude Desktop 等 AI 助手直接调用图床：上传本地截图、返回可访问 URL 和 Markdown 语法，方便写入博客或文档。

默认图床：[https://img.gwozai.email](https://img.gwozai.email)

## 功能

- 单张 / 批量上传图片、视频
- 自动返回完整 URL 和 `![alt](url)` Markdown
- 支持自定义 Telegraph-Image 实例（环境变量配置）
- 一行 `npx` 即可使用，无需本地克隆

## 快速开始

### 1. 配置 MCP

在 `~/.cursor/mcp.json` 中添加：

```json
{
  "mcpServers": {
    "telegraph-image": {
      "command": "npx",
      "args": ["-y", "telegraph-image-mcp"],
      "env": {
        "TELEGRAPH_IMAGE_BASE_URL": "https://img.gwozai.email"
      }
    }
  }
}
```

Claude Desktop（`claude_desktop_config.json`）同样适用。

### 2. 重启客户端

保存配置后重启 Cursor / Claude Desktop，在 MCP 面板确认 `telegraph-image` 已连接。

### 3. 对话中使用

```
把 /Users/me/screenshot.png 上传到图床
```

返回示例：

```json
{
  "file": "/Users/me/screenshot.png",
  "src": "/file/AgACAgUAAyEGAAS...png",
  "url": "https://img.gwozai.email/file/AgACAgUAAyEGAAS...png",
  "markdown": "![screenshot](https://img.gwozai.email/file/AgACAgUAAyEGAAS...png)"
}
```

## MCP 工具

| 工具 | 说明 |
|------|------|
| `upload_image` | 上传单张图片/视频。参数：`file_path`（必填）、`alt_text`（可选） |
| `upload_images` | 批量上传。参数：`file_paths`（路径数组） |
| `get_image_host_info` | 查看当前图床地址和 API 说明 |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `TELEGRAPH_IMAGE_BASE_URL` | `https://img.gwozai.email` | Telegraph-Image 图床地址 |

自建 [Telegraph-Image](https://github.com/cf-pages/Telegraph-Image) 实例时，改成你的域名即可。

## 图床 API 说明

Telegraph-Image 上传接口（本 MCP 内部调用）：

```
POST {BASE_URL}/upload
Content-Type: multipart/form-data
字段名: file
```

成功响应：

```json
[{"src": "/file/xxx.png"}]
```

完整访问地址：`{BASE_URL}/file/xxx.png`

## 常见问题

### `npx telegraph-image-mcp` 启动报 `ERR_MODULE_NOT_FOUND` / `completable.js`

通常是 **npx 缓存损坏**，不是包本身坏了。清理后重试：

```bash
rm -rf ~/.npm/_npx/*telegraph-image-mcp* ~/.npm/_npx/30e5450094f75aac
npx -y telegraph-image-mcp@0.1.1
```

或在 Cursor 里 **Settings → MCP → telegraph-image → Restart**。

详见 [CHANGELOG.md](CHANGELOG.md)。

### MCP 面板不显示 telegraph-image

1. 检查 `~/.cursor/mcp.json` JSON 格式
2. 确认本机已安装 Node.js ≥ 18：`node -v`
3. 重载 Cursor 窗口

### 平台支持

| 系统 | 支持 | 说明 |
|------|------|------|
| macOS | ✅ | 已实测 |
| Windows | ✅ | 路径用 `C:\...` 或 `C:/...` |
| Linux / CentOS | ✅ | 需 Node.js ≥ 18 |

## 版本记录

见 [CHANGELOG.md](CHANGELOG.md)。当前推荐：`telegraph-image-mcp@0.1.1`。

## 本地开发

```bash
git clone https://github.com/gwozai/telegraph-image-mcp.git
cd telegraph-image-mcp
npm install
npm run build
npm run dev
```

| 命令 | 说明 |
|------|------|
| `npm run build` | 编译 TypeScript → `dist/` |
| `npm run dev` | 开发模式直接运行 |
| `npm start` | 运行编译后的 MCP Server |

## 项目结构

```
telegraph-image-mcp/
├── src/
│   ├── index.ts      # MCP 工具注册
│   └── upload.ts     # 图床上传逻辑
├── package.json
├── tsconfig.json
└── README.md
```

## 相关链接

- npm：[telegraph-image-mcp](https://www.npmjs.com/package/telegraph-image-mcp)
- Telegraph-Image 原版：[cf-pages/Telegraph-Image](https://github.com/cf-pages/Telegraph-Image)
- MCP 协议：[Model Context Protocol](https://modelcontextprotocol.io/)

## License

[MIT](LICENSE)
