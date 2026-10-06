import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
const site = JSON.parse(
  await readFile(new URL("../src/site.json", import.meta.url), "utf8"),
);
const base = new URL(site.url).pathname;
const root = resolve(new URL("../dist/", import.meta.url).pathname);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
};
const port = Number(process.env.PORT || 4317);
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (path === "/" || path === base.slice(0, -1)) {
      res.writeHead(302, { Location: base });
      res.end();
      return;
    }
    if (!path.startsWith(base)) throw new Error("Outside base");
    let file = resolve(root, path.slice(base.length));
    if (file !== root && !file.startsWith(root + sep))
      throw new Error("Outside root");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const data = await readFile(file);
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Preview: http://127.0.0.1:${port}${base}`),
);
