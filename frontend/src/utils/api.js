let lastApiRequest = null;

export function getLastApiRequest() { return lastApiRequest; }

export async function fetchPosts({ cursor, limit = 20 } = {}) {
  const params = new URLSearchParams({ limit });
  if (cursor !== undefined && cursor !== null) params.set("cursor", cursor);
  const type = cursor === undefined || cursor === null
    ? "initial"
    : cursor < 0 ? "fetch-previous" : "fetch-next";
  lastApiRequest = { type, cursor: cursor ?? null, limit, timestamp: Date.now() };
  const response = await fetch(`/posts?${params}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

if (typeof window !== "undefined") window.getLastApiRequest = getLastApiRequest;