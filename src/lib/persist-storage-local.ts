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
  const heroMobile = st.imageOverrideMobile;
  if (typeof heroMobile === "string" && heroMobile.length > MAX_INLINE_IMAGE) {
    st.imageOverrideMobile = null;
    st.imageOverrideMobileWidth = null;
    st.imageOverrideMobileHeight = null;
    changed = true;
  }
  const banner = st.image;
  if (typeof banner === "string" && banner.length > MAX_INLINE_IMAGE) {
    st.image = null;
    changed = true;
  }
  const bannerMobile = st.imageMobile;
  if (typeof bannerMobile === "string" && bannerMobile.length > MAX_INLINE_IMAGE) {
    st.imageMobile = null;
    changed = true;
  }
  const testimonialItems = st.items;
  if (Array.isArray(testimonialItems)) {
    for (let i = 0; i < testimonialItems.length; i++) {
      const row = testimonialItems[i] as { imageUrl?: unknown; productImageUrl?: unknown };
      const timg = row?.imageUrl;
      if (typeof timg === "string" && timg.length > MAX_INLINE_IMAGE) {
        row.imageUrl = null;
        changed = true;
      }
      const pimg = row?.productImageUrl;
      if (typeof pimg === "string" && pimg.length > MAX_INLINE_IMAGE) {
        row.productImageUrl = null;
        changed = true;
      }
    }
  }
  return changed;
}

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
              if ("imageOverrideMobile" in parsed.state) {
                parsed.state.imageOverrideMobile = null;
                parsed.state.imageOverrideMobileWidth = null;
                parsed.state.imageOverrideMobileHeight = null;
              }
              parsed.state.image = null;
              if ("imageMobile" in parsed.state) parsed.state.imageMobile = null;
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
