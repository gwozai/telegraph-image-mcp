#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { getBaseUrl, uploadFile } from "./upload.js";

const server = new McpServer({
  name: "telegraph-image",
  version: "0.1.0",
});

server.tool(
  "upload_image",
  "上传本地图片或视频到 Telegraph-Image 图床，返回 URL 和 Markdown 语法",
  {
    file_path: z.string().describe("本地文件路径，支持 ~ 开头"),
    alt_text: z.string().optional().describe("Markdown alt 文本，默认用文件名"),
  },
  async ({ file_path, alt_text }) => {
    const result = await uploadFile(file_path);
    if (alt_text) {
      result.markdown = `![${alt_text}](${result.url})`;
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  },
);

server.tool(
  "upload_images",
  "批量上传多个本地图片/视频到 Telegraph-Image 图床",
  {
    file_paths: z.array(z.string()).describe("本地文件路径列表"),
  },
  async ({ file_paths }) => {
    const results = await Promise.all(
      file_paths.map(async (raw) => {
        try {
          const uploaded = await uploadFile(raw);
          return { status: "ok" as const, ...uploaded };
        } catch (error) {
          return {
            status: "fail" as const,
            file: raw,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    const success = results.filter((r) => r.status === "ok").length;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              base_url: getBaseUrl(),
              total: results.length,
              success,
              failed: results.length - success,
              results,
              markdown: results
                .filter((r) => r.status === "ok")
                .map((r) => r.markdown)
                .join("\n"),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.tool(
  "get_image_host_info",
  "查看当前图床地址和上传接口说明",
  {},
  async () => {
    const base = getBaseUrl();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              base_url: base,
              upload_endpoint: `${base}/upload`,
              method: "POST",
              form_field: "file",
              response_example: [{ src: "/file/xxx.png" }],
              full_url_example: `${base}/file/xxx.png`,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
