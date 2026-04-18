const MAX_INLINE_IMAGE = 450_000;

function tryStripOversizedImages(parsed: { state?: Record<string, unknown> }): boolean {
  let changed = false;
  const st = parsed.state;
  if (!st) return false;
  const img = st.imageOverride;
  if (typeof img === "string" && img.length > MAX_INLINE_IMAGE) {
    st.imageOverride = null;
    st.useImageOverride = false;
    changed = true;
  }
  const banner = st.image;
  if (typeof banner === "string" && banner.length > MAX_INLINE_IMAGE) {
    st.image = null;
    changed = true;
  }
  return changed;
}

/** localStorage com migração e retry quando a quota estoura (imagens base64 antigas). */
export function createSafeLocalStorage() {
  return {
    getItem: (name: string) => {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
        if (tryStripOversizedImages(parsed)) {
          localStorage.setItem(name, JSON.stringify(parsed));
        }
        return JSON.stringify(parsed);
      } catch {
        return raw;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
      } catch (e) {
        if (
          e instanceof DOMException &&
          (e.code === 22 || e.code === 1014 || e.name === "QuotaExceededError")
        ) {
          try {
            const parsed = JSON.parse(value) as { state?: Record<string, unknown> };
            if (parsed.state) {
              parsed.state.imageOverride = null;
              parsed.state.useImageOverride = false;
              parsed.state.image = null;
              localStorage.setItem(name, JSON.stringify(parsed));
            }
          } catch {
            /* noop */
          }
        }
      }
    },
    removeItem: (name: string) => localStorage.removeItem(name),
  };
}
