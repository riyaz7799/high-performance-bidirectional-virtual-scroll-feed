import { useState, useEffect, useRef, useCallback } from "react";
import { fetchPosts } from "../utils/api";
import { getEstimatedHeight, measureHeight, getCachedHeight } from "../utils/heights";

const BATCH_SIZE = 20;
const BUFFER_ITEMS = 8;
const SCROLL_THRESHOLD = 400;

export function useVirtualFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState({ top: false, bottom: false, initial: true });
  const [cursors, setCursors] = useState({ next: null, prev: null });
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [totalHeight, setTotalHeight] = useState(0);
  const [offsets, setOffsets] = useState([]);

  const scrollRef = useRef(null);
  const fetchingRef = useRef({ top: false, bottom: false });
  const postsRef = useRef([]);
  const offsetsRef = useRef([]);
  postsRef.current = posts;
  offsetsRef.current = offsets;

  const recalcLayout = useCallback((list) => {
    let offset = 0;
    const newOffsets = list.map((p) => {
      const o = offset;
      offset += getCachedHeight(p.id) || getEstimatedHeight(p);
      return o;
    });
    setOffsets(newOffsets);
    setTotalHeight(offset);
    return newOffsets;
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const result = await fetchPosts({ limit: BATCH_SIZE });
        setPosts(result.data);
        setCursors({
          next: result.nextCursor,
          prev: result.data.length > 0 ? -result.data[0].id : null,
        });
        recalcLayout(result.data);
      } catch (e) {
        console.error("Initial load failed:", e);
      } finally {
        setLoading((l) => ({ ...l, initial: false }));
      }
    }
    init();
  }, [recalcLayout]);

  const fetchNext = useCallback(async () => {
    if (fetchingRef.current.bottom || cursors.next === null) return;
    fetchingRef.current.bottom = true;
    setLoading((l) => ({ ...l, bottom: true }));
    try {
      const result = await fetchPosts({ cursor: cursors.next, limit: BATCH_SIZE });
      if (!result.data.length) return;
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const merged = [...prev, ...result.data.filter((p) => !ids.has(p.id))];
        recalcLayout(merged);
        return merged;
      });
      setCursors((c) => ({ ...c, next: result.nextCursor }));
    } catch (e) {
      console.error("Fetch next failed:", e);
    } finally {
      fetchingRef.current.bottom = false;
      setLoading((l) => ({ ...l, bottom: false }));
    }
  }, [cursors.next, recalcLayout]);

  const fetchPrev = useCallback(async () => {
    if (fetchingRef.current.top || cursors.prev === null) return;
    fetchingRef.current.top = true;
    setLoading((l) => ({ ...l, top: true }));

    const container = scrollRef.current;
    const scrollHeightBefore = container ? container.scrollHeight : 0;
    const scrollTopBefore = container ? container.scrollTop : 0;

    try {
      const result = await fetchPosts({ cursor: cursors.prev, limit: BATCH_SIZE });
      if (!result.data.length) return;
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newPosts = result.data.filter((p) => !ids.has(p.id));
        if (!newPosts.length) return prev;
        const merged = [...newPosts, ...prev];
        recalcLayout(merged);

        // Scroll position preservation - CRITICAL requirement 10
        requestAnimationFrame(() => {
          if (container) {
            const scrollHeightAfter = container.scrollHeight;
            const heightDiff = scrollHeightAfter - scrollHeightBefore;
            container.scrollTop = scrollTopBefore + heightDiff;
          }
        });

        return merged;
      });
      setCursors((c) => ({
        ...c,
        prev: result.data.length > 0 ? -result.data[0].id : null,
      }));
    } catch (e) {
      console.error("Fetch prev failed:", e);
    } finally {
      fetchingRef.current.top = false;
      setLoading((l) => ({ ...l, top: false }));
    }
  }, [cursors.prev, recalcLayout]);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const cur = postsRef.current;
    const offs = offsetsRef.current;

    if (scrollTop < SCROLL_THRESHOLD) fetchPrev();
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) fetchNext();

    // Compute visible range
    let start = 0;
    let end = cur.length;
    const viewTop = scrollTop - 600;
    const viewBottom = scrollTop + clientHeight + 600;

    for (let i = 0; i < offs.length; i++) {
      const itemBottom = offs[i] + (getCachedHeight(cur[i]?.id) || getEstimatedHeight(cur[i] || {}));
      if (itemBottom >= viewTop) {
        start = Math.max(0, i - BUFFER_ITEMS);
        break;
      }
    }
    for (let i = start; i < offs.length; i++) {
      if (offs[i] > viewBottom) {
        end = Math.min(cur.length, i + BUFFER_ITEMS);
        break;
      }
    }

    setVisibleRange({ start, end });
  }, [fetchNext, fetchPrev]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const onHeightMeasured = useCallback((postId, height) => {
    measureHeight(postId, height);
    setPosts((prev) => {
      recalcLayout(prev);
      return prev;
    });
  }, [recalcLayout]);

  return { posts, loading, visibleRange, totalHeight, offsets, scrollRef, onHeightMeasured };
}