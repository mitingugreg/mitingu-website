import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, normalize } from "node:path";
import "../src/build.mjs";
import { redirects } from "../src/site.mjs";

const root = join(process.cwd(), "dist", "client");
const cmsRoot = join(process.cwd(), "cms");
const assetsRoot = join(process.cwd(), "public", "assets");
const contentFile = join(process.cwd(), "content", "site-content.json");
const buildScript = join(process.cwd(), "src", "build.mjs");
const port = Number(process.env.PORT || 3000);
const maxUploadBodyLength = 15_000_000;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const imageMimes = {
  "image/gif": [".gif"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const imageExtensions = new Set(Object.values(imageMimes).flat());

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return clean === "/" ? "/index.html" : clean;
}

async function resolveFile(base, urlPath) {
  const requested = safePath(urlPath);
  const full = join(base, requested);

  try {
    const info = await stat(full);
    if (info.isDirectory()) return join(full, "index.html");
    return full;
  } catch {
    if (!extname(full)) return join(base, requested, "index.html");
    return full;
  }
}

function json(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

async function requestBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
    if (body.length > maxUploadBodyLength) throw new Error("Request body is too large");
  }

  return body;
}

function validateContent(content) {
  const errors = [];

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return ["Content must be a JSON object"];
  }

  if (!content.site?.name) errors.push("Site name is required");
  if (!content.site?.email) errors.push("Site email is required");
  if (!content.metadata || typeof content.metadata !== "object") {
    errors.push("Metadata is required");
  }

  for (const [path, entry] of Object.entries(content.metadata || {})) {
    if (!path.startsWith("/")) errors.push(`Metadata path must start with /: ${path}`);
    if (!Array.isArray(entry) || entry.length < 2) {
      errors.push(`Metadata for ${path} must include a title and description`);
    }
  }

  if (!Array.isArray(content.navItems)) errors.push("Navigation items are required");
  if (!content.redirects || typeof content.redirects !== "object") errors.push("Redirects are required");

  return errors;
}

function sanitizeAssetName(fileName, mime) {
  const preferredExtension = imageMimes[mime]?.[0] || ".png";
  const currentExtension = extname(fileName || "").toLowerCase();
  const extension = imageExtensions.has(currentExtension) ? currentExtension : preferredExtension;
  const base = basename(fileName || "image", currentExtension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "image"}${extension}`;
}

function extensionMatchesMime(fileName, mime) {
  const extension = extname(fileName).toLowerCase();
  return imageMimes[mime]?.includes(extension) || false;
}

async function assetExists(fileName) {
  try {
    await stat(join(assetsRoot, fileName));
    return true;
  } catch {
    return false;
  }
}

async function availableAssetName(fileName) {
  const extension = extname(fileName).toLowerCase();
  const base = basename(fileName, extension);
  let candidate = fileName;
  let index = 2;

  while (await assetExists(candidate)) {
    candidate = `${base}-${index}${extension}`;
    index += 1;
  }

  return candidate;
}

async function listMedia() {
  await mkdir(assetsRoot, { recursive: true });
  const entries = await readdir(assetsRoot, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase()))
      .map(async (entry) => {
        const info = await stat(join(assetsRoot, entry.name));
        return {
          name: entry.name,
          path: `/assets/${entry.name}`,
          url: `/assets/${entry.name}`,
          size: info.size,
          updatedAt: info.mtime.toISOString(),
          extension: extname(entry.name).slice(1).toLowerCase(),
        };
      }),
  );

  return files.sort((a, b) => a.name.localeCompare(b.name));
}

function decodeImageUpload(dataUrl) {
  const match = /^data:(image\/(?:gif|jpeg|png|webp));base64,([a-z0-9+/=]+)$/i.exec(dataUrl || "");
  if (!match) throw new Error("Upload must be a PNG, JPEG, WEBP or GIF image");

  return {
    mime: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], "base64"),
  };
}

function rebuild() {
  return new Promise((resolve, reject) => {
    execFile(process.execPath, [buildScript], { cwd: process.cwd(), timeout: 30_000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${stderr || stdout || error.message}`.trim()));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function handleCmsApi(request, response, pathname) {
  if (pathname === "/cms/api/content" && request.method === "GET") {
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(await readFile(contentFile, "utf8"));
    return true;
  }

  if (pathname === "/cms/api/content" && (request.method === "PUT" || request.method === "POST")) {
    let nextContent;

    try {
      nextContent = JSON.parse(await requestBody(request));
    } catch (error) {
      json(response, 400, { ok: false, error: error.message });
      return true;
    }

    const errors = validateContent(nextContent);
    if (errors.length) {
      json(response, 422, { ok: false, errors });
      return true;
    }

    const previous = await readFile(contentFile, "utf8");

    try {
      await writeFile(contentFile, `${JSON.stringify(nextContent, null, 2)}\n`);
      const output = await rebuild();
      json(response, 200, { ok: true, output });
    } catch (error) {
      await writeFile(contentFile, previous);
      await rebuild().catch(() => {});
      json(response, 500, { ok: false, error: error.message });
    }

    return true;
  }

  if (pathname === "/cms/api/media" && request.method === "GET") {
    json(response, 200, { ok: true, media: await listMedia() });
    return true;
  }

  if (pathname === "/cms/api/media" && request.method === "POST") {
    try {
      const upload = JSON.parse(await requestBody(request));
      const { mime, buffer } = decodeImageUpload(upload.dataUrl);
      let fileName = sanitizeAssetName(upload.filename || "image", mime);

      if (!extensionMatchesMime(fileName, mime)) {
        throw new Error("The filename extension must match the uploaded image type");
      }

      if (upload.replace) {
        fileName = sanitizeAssetName(upload.target || upload.filename, mime);
        if (!(await assetExists(fileName))) {
          throw new Error(`Cannot replace ${fileName} because it does not exist`);
        }
        if (!extensionMatchesMime(fileName, mime)) {
          throw new Error("Replacement image type must match the existing filename extension");
        }
      } else {
        fileName = await availableAssetName(fileName);
      }

      await mkdir(assetsRoot, { recursive: true });
      await writeFile(join(assetsRoot, fileName), buffer);
      const output = await rebuild();
      json(response, 200, {
        ok: true,
        media: await listMedia(),
        file: `/assets/${fileName}`,
        output,
      });
    } catch (error) {
      json(response, 400, { ok: false, error: error.message });
    }

    return true;
  }

  if (pathname === "/cms/api/rebuild" && request.method === "POST") {
    try {
      const output = await rebuild();
      json(response, 200, { ok: true, output });
    } catch (error) {
      json(response, 500, { ok: false, error: error.message });
    }

    return true;
  }

  return false;
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);

  try {
    if (await handleCmsApi(request, response, url.pathname)) return;

    if (url.pathname === "/cms") {
      response.writeHead(302, { location: "/cms/" });
      response.end();
      return;
    }

    const redirectTo = redirects[url.pathname];
    if (redirectTo) {
      const destination = new URL(redirectTo, `http://localhost:${port}`);
      destination.search = url.search;
      response.writeHead(301, { location: `${destination.pathname}${destination.search}` });
      response.end();
      return;
    }

    const base = url.pathname.startsWith("/cms/") ? cmsRoot : root;
    const filePath = url.pathname.startsWith("/cms/")
      ? url.pathname.replace(/^\/cms\/?/, "/")
      : url.pathname;
    const file = await resolveFile(base, filePath);
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "cache-control": url.pathname.startsWith("/cms/") ? "no-store" : "public, max-age=60",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Mitingu site running at http://localhost:${port}`);
});
