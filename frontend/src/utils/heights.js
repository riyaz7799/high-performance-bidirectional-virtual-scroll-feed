const heightCache = new Map();
const DEFAULT_HEIGHT = 400;
export function getEstimatedHeight(post) {
  if (heightCache.has(post.id)) return heightCache.get(post.id);
  let h = 120;
  const wordCount = post.content?.split(" ").length || 0;
  h += Math.ceil(wordCount / 8) * 22;
  if (post.media?.type === "image") h += post.media.urls.length > 1 ? 320 : 380;
  else if (post.media?.type === "video") h += 320;
  h += 60;
  return Math.max(h, DEFAULT_HEIGHT);
}
export function measureHeight(postId, height) { if (height > 0) heightCache.set(postId, height); }
export function getCachedHeight(postId) { return heightCache.get(postId) || DEFAULT_HEIGHT; }
export function getPostMeasurements() {
  const result = {};
  heightCache.forEach((h, id) => { result[id] = h; });
  return result;
}
if (typeof window !== "undefined") window.getPostMeasurements = getPostMeasurements;
