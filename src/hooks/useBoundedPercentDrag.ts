"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function clampPct(n: number, min = 0, max = 100) {
  return Math.round(Math.min(max, Math.max(min, n)) * 10) / 10;
}

type DragSession = {
  pointerId: number;
  startPx: number;
  startPy: number;
  startLeftPct: number;
  startTopPct: number;
};

function computeBoundedPosition(
  box: HTMLElement,
  el: HTMLElement,
  sess: DragSession,
  clientX: number,
  clientY: number
) {
  const br = box.getBoundingClientRect();
  const dxPct = ((clientX - sess.startPx) / br.width) * 100;
  const dyPct = ((clientY - sess.startPy) / br.height) * 100;
  let nl = sess.startLeftPct + dxPct;
  let nt = sess.startTopPct + dyPct;
  const ew = (el.offsetWidth / br.width) * 100;
  const eh = (el.offsetHeight / br.height) * 100;
  nl = Math.max(0, Math.min(100 - ew, nl));
  nt = Math.max(0, Math.min(100 - eh, nt));
  return { l: nl, t: nt };
}

/**
 * Arrasta um bloco `position:absolute` com `left`/`top` em % relativos a `constraintsRef`.
 * A posição durante o arraste fica em estado (evita re-renders a anularem o movimento).
 * Atualização do movimento em requestAnimationFrame para fluidez.
 */
export function useBoundedPercentDrag({
  editable,
  constraintsRef,
  contentLeftPct,
  contentTopPct,
  onCommit,
}: {
  editable: boolean;
  constraintsRef: React.RefObject<HTMLElement | null>;
  contentLeftPct: number;
  contentTopPct: number;
  onCommit: (leftPct: number, topPct: number) => void;
}) {
  const blockRef = useRef<HTMLDivElement | null>(null);
  const sessionRef = useRef<DragSession | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ l: number; t: number } | null>(null);

  const [dragging, setDragging] = useState(false);
  const [live, setLive] = useState({ l: 0, t: 0 });

  const leftPct = dragging ? live.l : contentLeftPct;
  const topPct = dragging ? live.t : contentTopPct;

  const cancelRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pendingRef.current = null;
  }, []);

  const flushMove = useCallback(() => {
    rafRef.current = null;
    const pending = pendingRef.current;
    const sess = sessionRef.current;
    const box = constraintsRef.current;
    const el = blockRef.current;
    if (!pending || !sess || !box || !el) return;

    const { l, t } = computeBoundedPosition(box, el, sess, pending.x, pending.y);
    lastPosRef.current = { l, t };
    setLive({ l, t });
  }, [constraintsRef]);

  const scheduleMove = useCallback(
    (x: number, y: number) => {
      pendingRef.current = { x, y };
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(flushMove);
      }
    },
    [flushMove]
  );

  const cleanupSession = useCallback(() => {
    cancelRaf();
    sessionRef.current = null;
    setDragging(false);
    document.body.style.removeProperty("cursor");
  }, [cancelRaf]);

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const sess = sessionRef.current;
      if (!sess || sess.pointerId !== e.pointerId) return;

      const box = constraintsRef.current;
      const el = blockRef.current;
      cancelRaf();

      let nl: number;
      let nt: number;
      if (box && el) {
        const p = computeBoundedPosition(box, el, sess, e.clientX, e.clientY);
        nl = p.l;
        nt = p.t;
      } else if (lastPosRef.current) {
        nl = lastPosRef.current.l;
        nt = lastPosRef.current.t;
      } else {
        cleanupSession();
        return;
      }

      /* Limpar sessão antes de releasePointerCapture: lostpointercapture dispara na mesma stack e não deve voltar a gravar. */
      sessionRef.current = null;
      setDragging(false);
      document.body.style.removeProperty("cursor");

      if (el) {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          /* já libertado */
        }
      }

      onCommit(clampPct(nl), clampPct(nt));
    },
    [cancelRaf, cleanupSession, constraintsRef, onCommit]
  );

  const onLostPointerCapture = useCallback(() => {
    const sess = sessionRef.current;
    if (!sess) return;
    const p = lastPosRef.current;
    cleanupSession();
    if (p) {
      onCommit(clampPct(p.l), clampPct(p.t));
    }
  }, [cleanupSession, onCommit]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!editable) return;
      if (e.button !== 0) return;
      const box = constraintsRef.current;
      const el = blockRef.current;
      if (!box || !el) return;
      e.preventDefault();
      e.stopPropagation();

      const br = box.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const startLeftPct = ((er.left - br.left) / br.width) * 100;
      const startTopPct = ((er.top - br.top) / br.height) * 100;

      sessionRef.current = {
        pointerId: e.pointerId,
        startPx: e.clientX,
        startPy: e.clientY,
        startLeftPct,
        startTopPct,
      };
      const init = { l: startLeftPct, t: startTopPct };
      lastPosRef.current = init;
      setLive(init);
      setDragging(true);

      el.setPointerCapture(e.pointerId);
      document.body.style.cursor = "grabbing";
    },
    [editable, constraintsRef]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!sessionRef.current || e.pointerId !== sessionRef.current.pointerId) return;
      scheduleMove(e.clientX, e.clientY);
    },
    [scheduleMove]
  );

  useEffect(() => () => cancelRaf(), [cancelRaf]);

  if (!editable) {
    return {
      blockRef,
      positionLeftPct: contentLeftPct,
      positionTopPct: contentTopPct,
      dragProps: {} as const,
    };
  }

  return {
    blockRef,
    positionLeftPct: leftPct,
    positionTopPct: topPct,
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onLostPointerCapture,
    },
  };
}
