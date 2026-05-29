import { readFileSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { homedir } from "node:os";

const DEFAULT_BASE_URL = "https://img.gwozai.email";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export function getBaseUrl(): string {
  return (process.env.TELEGRAPH_IMAGE_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function resolveFilePath(filePath: string): string {
  if (filePath.startsWith("~/")) {
    return resolve(homedir(), filePath.slice(2));
  }
  if (filePath === "~") {
    return homedir();
  }
  return resolve(filePath);
}

function getMime(filename: string): string {
  return MIME[extname(filename).toLowerCase()] ?? "application/octet-stream";
}

function stem(filename: string): string {
  const name = basename(filename);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export interface UploadResult {
  file: string;
  src: string;
  url: string;
  markdown: string;
}

export async function uploadFile(
  filePath: string,
  baseUrl = getBaseUrl(),
): Promise<UploadResult> {
  const resolved = resolveFilePath(filePath);
  const base = baseUrl.replace(/\/$/, "");

  try {
    statSync(resolved);
  } catch {
    throw new Error(`文件不存在: ${resolved}`);
  }

  const name = basename(resolved);
  const buffer = readFileSync(resolved);
  const form = new FormData();
  form.append("file", new Blob([buffer], { type: getMime(name) }), name);

  const resp = await fetch(`${base}/upload`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(120_000),
  });

  if (!resp.ok) {
    throw new Error(`上传失败 HTTP ${resp.status}: ${await resp.text()}`);
  }

  const data = (await resp.json()) as Array<{ src?: string }>;
  if (!Array.isArray(data) || !data[0]?.src) {
    throw new Error(`响应格式异常: ${JSON.stringify(data)}`);
  }

  const src = data[0].src;
  const url = src.startsWith("http") ? src : `${base}${src}`;

  return {
    file: resolved,
    src,
    url,
    markdown: `![${stem(name)}](${url})`,
  };
}
