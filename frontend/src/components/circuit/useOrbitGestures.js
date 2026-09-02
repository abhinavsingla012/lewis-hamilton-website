import { useCallback, useEffect, useRef, useState } from "react";
import { orbitDrag, orbitZoom } from "../../three/circuitOrbit";

/**
 * Pointer gestures for the top-down overview: drag rotates, pinch / ctrl-wheel zooms.
 * Vertical touch swipes are released untouched so the spatial engine still steps chapters.
 */
export const useOrbitGestures = ({ orbitRef, travelRef, enabledRef, wrapperRef }) => {
  const pointers = useRef(new Map());
  const gesture = useRef({ active: false, pinch: 0 });
  const [touched, setTouched] = useState(false);

  const beginDrag = useCallback(() => {
    orbitRef.current.dragging = true;
    travelRef.current.dragging = true;
    gesture.current.active = true;
    wrapperRef.current?.setAttribute("data-dragging", "true");
    setTouched(true);
  }, [orbitRef, travelRef, wrapperRef]);

  const endDrag = useCallback(() => {
    const orbit = orbitRef.current;
    orbit.dragging = false;
    orbit.idle = 0;
    travelRef.current.dragging = false;
    gesture.current.active = false;
    gesture.current.pinch = 0;
    wrapperRef.current?.removeAttribute("data-dragging");
  }, [orbitRef, travelRef, wrapperRef]);

  const onPointerDown = useCallback((event) => {
    if (!enabledRef.current) return;
    if (event.target.closest?.(".circuit-pin, a, button")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY, t: event.timeStamp });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [enabledRef]);

  const onPointerMove = useCallback((event) => {
    const pointer = pointers.current.get(event.pointerId);
    if (!pointer) return;
    const orbit = orbitRef.current;
    if (pointers.current.size >= 2) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const [a, b] = [...pointers.current.values()];
      const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
      if (gesture.current.pinch) orbitZoom(orbit, gesture.current.pinch / distance);
      gesture.current.pinch = distance;
      if (!gesture.current.active) beginDrag();
      return;
    }
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (!gesture.current.active) {
      const tx = event.clientX - pointer.startX;
      const ty = event.clientY - pointer.startY;
      if (Math.hypot(tx, ty) < 6) return;
      if (event.pointerType === "touch" && Math.abs(ty) > Math.abs(tx) * 1.2) {
        pointers.current.delete(event.pointerId);
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        return;
      }
      beginDrag();
    }
    orbitDrag(orbit, dx, dy, (event.timeStamp - pointer.t) / 1000);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.t = event.timeStamp;
  }, [beginDrag, orbitRef]);

  const onPointerUp = useCallback((event) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) {
      if (gesture.current.active) endDrag();
    } else {
      gesture.current.pinch = 0;
    }
  }, [endDrag]);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return undefined;
    const onWheel = (event) => {
      if (!event.ctrlKey || !enabledRef.current) return;
      event.preventDefault();
      orbitZoom(orbitRef.current, Math.exp(event.deltaY * 0.0014));
      setTouched(true);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [enabledRef, orbitRef, wrapperRef]);

  return { touched, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
};
