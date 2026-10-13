// Generated HTML uses double-quoted, escaped attributes throughout.
export function openExternalLinks(html, siteURL) {
  const site = new URL(siteURL);
  return html.replace(/<a\b[^>]*>/g, (tag) => {
    const href = tag.match(/\shref="([^"]*)"/)?.[1];
    if (!href) return tag;
    const url = new URL(href, site);
    if (!["http:", "https:"].includes(url.protocol)) return tag;
    const internal =
      url.origin === site.origin &&
      (url.pathname === site.pathname.replace(/\/$/, "") ||
        url.pathname.startsWith(site.pathname));
    if (internal) return tag;
    const rel = new Set(
      (tag.match(/\srel="([^"]*)"/)?.[1] || "").split(/\s+/).filter(Boolean),
    );
    rel.add("noopener");
    rel.add("noreferrer");
    return tag
      .replace(/\s(?:target|rel)="[^"]*"/g, "")
      .replace(/>$/, ` target="_blank" rel="${[...rel].join(" ")}">`);
  });
}
