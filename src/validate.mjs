import { bech32, bech32m } from "bech32";

export function validateSite(site) {
  const url = new URL(site.url);
  if (url.protocol !== "https:" || !url.pathname.endsWith("/"))
    throw new Error("Site URL must be HTTPS with a trailing slash");
  if (!site.owner.name || !site.owner.nameRu || !site.owner.handle)
    throw new Error("Owner identity is required");
  const https = (value) => {
    if (new URL(value).protocol !== "https:")
      throw new Error("Links must use HTTPS");
  };
  https(site.owner.github);
  if (site.boosty) {
    https(site.boosty);
    if (new URL(site.boosty).hostname !== "boosty.to")
      throw new Error("Use a boosty.to profile URL");
  }
  const networks = {
    BTC: ["Bitcoin"],
    ETH: ["Ethereum"],
    GRAM: ["TON"],
    TON: ["TON"],
    USDT: ["TON", "TRON", "Ethereum", "Solana", "BNB Smart Chain"],
  };
  const ids = new Set();
  for (const w of site.wallets) {
    if (!/^[a-z][a-z0-9-]*$/.test(w.id) || ids.has(w.id))
      throw new Error("Wallet IDs must be unique safe slugs");
    ids.add(w.id);
    if (!networks[w.coin]?.includes(w.network))
      throw new Error(`Unsupported coin/network: ${w.coin}/${w.network}`);
    if (
      !w.name ||
      !w.address ||
      w.address.trim() !== w.address ||
      /\s|[<>"']/.test(w.address)
    )
      throw new Error("A real public address is required");
    if (w.network === "Bitcoin") {
      let decoded;
      try {
        decoded = bech32.decode(w.address);
        if (decoded.words[0] !== 0) throw new Error("Encoding");
      } catch {
        decoded = bech32m.decode(w.address);
        if (decoded.words[0] === 0) throw new Error("Encoding");
      }
      const program = bech32.fromWords(decoded.words.slice(1));
      if (
        decoded.prefix !== "bc" ||
        decoded.words[0] > 16 ||
        program.length < 2 ||
        program.length > 40 ||
        (decoded.words[0] === 0 && ![20, 32].includes(program.length))
      )
        throw new Error("Invalid Bitcoin mainnet address");
    } else if (
      ["Ethereum", "BNB Smart Chain"].includes(w.network) &&
      !/^0x[0-9a-fA-F]{40}$/.test(w.address)
    )
      throw new Error("Invalid EVM address");
    else if (
      w.network === "TRON" &&
      !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(w.address)
    )
      throw new Error("Invalid TRON address");
    else if (w.network === "TON" && !/^[EU]Q[A-Za-z0-9_-]{46}$/.test(w.address))
      throw new Error("Use a mainnet TON friendly address");
    else if (
      w.network === "Solana" &&
      !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(w.address)
    )
      throw new Error("Invalid Solana address");
  }
  if (!site.wallets.length && !site.boosty)
    throw new Error("At least one real donation method is required");
  for (const p of site.projects) {
    https(p.url);
    if (!p.name || !p.ru || !p.en)
      throw new Error("Projects must have both translations");
  }
  const conferenceIds = new Set();
  for (const talk of site.conferences ?? []) {
    https(talk.video);
    if (!/^[a-z][a-z0-9-]*$/.test(talk.id) || conferenceIds.has(talk.id))
      throw new Error("Conference IDs must be unique safe slugs");
    conferenceIds.add(talk.id);
    if (
      !talk.event ||
      !Number.isInteger(talk.year) ||
      talk.year < 2000 ||
      talk.year > 2100
    )
      throw new Error("Conference event and year are required");
    if (
      !/^[a-zA-Z][a-zA-Z0-9]*$/.test(talk.titleKey) ||
      !/^assets\/[a-z0-9-]+\.pdf$/.test(talk.slides)
    )
      throw new Error("Conference title key and local PDF path are required");
  }
  return site;
}
