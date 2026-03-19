export async function fetchText(url: string, opts?: { timeoutMs?: number }) {
  const timeoutMs = opts?.timeoutMs ?? 12_000;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const contact = process.env.DIGEST_BOT_CONTACT ?? "you@example.com";
    const res = await fetch(url, {
      headers: {
        // Some feeds reject default user agents.
        "user-agent": `AI+VC Digest Bot/0.1 (RSS fetcher; contact: ${contact})`
      },
      signal: ac.signal
    });
    if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}
