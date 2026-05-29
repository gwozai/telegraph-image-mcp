# Changelog

## 0.1.1 — 2026-05-29

### 修复

- 将 `@modelcontextprotocol/sdk` 从 `^1.29.0` 锁定为精确版本 `1.29.0`，降低 npx 拉取到不完整依赖的概率
- 补充 README「常见问题」：npx 缓存损坏导致 `ERR_MODULE_NOT_FOUND` / `completable.js` 的排查与清理方法

### 说明

**现象（0.1.0 及早期 npx 缓存）**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'.../node_modules/@modelcontextprotocol/sdk/dist/esm/server/completable.js'
```

**根因**

- 多数是 `~/.npm/_npx/` 缓存损坏（`completable.js` 缺失，但 `.map` 仍在）
- 不是 telegraph-image-mcp 业务代码问题

**处理**

```bash
rm -rf ~/.npm/_npx/*telegraph-image-mcp* ~/.npm/_npx/30e5450094f75aac
npx -y telegraph-image-mcp@0.1.1
```

**验证**

- 全新 `npm install telegraph-image-mcp@0.1.1` 可启动
- `npx -y telegraph-image-mcp@0.1.1` 可调用 `upload_image` 并成功上传
- Cursor `mcp.json` 标准配置可用：

```json
"telegraph-image": {
  "command": "npx",
  "args": ["-y", "telegraph-image-mcp"],
  "env": {
    "TELEGRAPH_IMAGE_BASE_URL": "https://img.gwozai.email"
  }
}
```

### 平台

- macOS / Windows / Linux（CentOS 等）均可用
- 要求：Node.js ≥ 18、可访问图床地址

## 0.1.0 — 2026-05-29

- 初始发布：单张/批量上传、Markdown 返回、自定义图床地址
