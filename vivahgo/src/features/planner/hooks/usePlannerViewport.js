import { useCallback, useEffect, useRef, useState } from "react";

const KEYBOARD_SCROLL_STEP_MIN = 56;
const KEYBOARD_SCROLL_STEP_MAX = 144;
const KEYBOARD_SCROLL_STEP_RATIO = 0.12;
const KEYBOARD_SCROLL_ANIMATION_DURATION_MS = 220;
const KEYBOARD_SCROLL_FOCUSABLE_SELECTOR = [
  "input",
  "textarea",
  "select",
  "[contenteditable='true']",
  "[role='textbox']",
  "[role='searchbox']",
  "[role='combobox']",
  "[role='listbox']",
  "[role='menu']",
  "[role='menubar']",
  "[role='menuitem']",
  "[role='tree']",
  "[role='treeitem']",
  "[role='grid']",
  "[role='row']",
  "[role='tablist']",
  "[role='slider']",
  "[role='spinbutton']",
].join(", ");

function isEditableKeyboardTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.matches(KEYBOARD_SCROLL_FOCUSABLE_SELECTOR)) {
    return true;
  }

  return Boolean(target.closest(KEYBOARD_SCROLL_FOCUSABLE_SELECTOR));
}

function getKeyboardScrollStep(scrollHost) {
  if (!scrollHost) {
    return KEYBOARD_SCROLL_STEP_MIN;
  }

  return Math.round(
    Math.min(
      KEYBOARD_SCROLL_STEP_MAX,
      Math.max(KEYBOARD_SCROLL_STEP_MIN, scrollHost.clientHeight * KEYBOARD_SCROLL_STEP_RATIO)
    )
  );
}

function shouldReduceMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function easeOutCubic(progress) {
  return 1 - ((1 - progress) ** 3);
}

export function usePlannerViewport({ screen, setShowDesktopFooter }) {
  const [isDesktopView, setIsDesktopView] = useState(() => (
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false
  ));

  const contentAreaRef = useRef(null);
  const previousScrollTopRef = useRef(0);
  const keyboardScrollAnimationFrameRef = useRef(0);
  const keyboardScrollTargetRef = useRef(null);

  const stopKeyboardScrollAnimation = useCallback(() => {
    if (keyboardScrollAnimationFrameRef.current) {
      window.cancelAnimationFrame(keyboardScrollAnimationFrameRef.current);
      keyboardScrollAnimationFrameRef.current = 0;
    }
  }, []);

  const animatePlannerScrollToTarget = useCallback(() => {
    function startAnimation() {
      const scrollHost = contentAreaRef.current;
      const nextTarget = keyboardScrollTargetRef.current;

      if (!scrollHost || nextTarget == null) {
        return;
      }

      if (shouldReduceMotion()) {
        stopKeyboardScrollAnimation();
        scrollHost.scrollTop = nextTarget;
        return;
      }

      const startScrollTop = scrollHost.scrollTop;
      const distance = nextTarget - startScrollTop;

      if (Math.abs(distance) < 1) {
        stopKeyboardScrollAnimation();
        scrollHost.scrollTop = nextTarget;
        return;
      }

      stopKeyboardScrollAnimation();
      const startTime = performance.now();

      const tick = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / KEYBOARD_SCROLL_ANIMATION_DURATION_MS);
        scrollHost.scrollTop = startScrollTop + (distance * easeOutCubic(progress));

        if (progress < 1) {
          keyboardScrollAnimationFrameRef.current = window.requestAnimationFrame(tick);
          return;
        }

        scrollHost.scrollTop = nextTarget;
        keyboardScrollAnimationFrameRef.current = 0;

        if (keyboardScrollTargetRef.current !== nextTarget) {
          startAnimation();
        }
      };

      keyboardScrollAnimationFrameRef.current = window.requestAnimationFrame(tick);
    }

    startAnimation();
  }, [stopKeyboardScrollAnimation]);

  const animatePlannerScrollBy = useCallback((delta) => {
    const scrollHost = contentAreaRef.current;
    if (!scrollHost || delta === 0) {
      return;
    }

    const maxScrollTop = Math.max(0, scrollHost.scrollHeight - scrollHost.clientHeight);
    const currentTarget = keyboardScrollTargetRef.current ?? scrollHost.scrollTop;
    keyboardScrollTargetRef.current = Math.min(maxScrollTop, Math.max(0, currentTarget + delta));
    animatePlannerScrollToTarget();
  }, [animatePlannerScrollToTarget]);

  const handlePlannerContentKeyDown = useCallback((event) => {
    if (screen !== "app" || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    if (isEditableKeyboardTarget(event.target)) {
      return;
    }

    const scrollHost = contentAreaRef.current;
    if (!scrollHost) {
      return;
    }

    const maxScrollTop = Math.max(0, scrollHost.scrollHeight - scrollHost.clientHeight);
    if (maxScrollTop <= 0) {
      return;
    }

    const step = getKeyboardScrollStep(scrollHost);
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const projectedTarget = (keyboardScrollTargetRef.current ?? scrollHost.scrollTop) + (step * direction);

    if ((direction > 0 && projectedTarget <= scrollHost.scrollTop && scrollHost.scrollTop >= maxScrollTop)
      || (direction < 0 && projectedTarget >= scrollHost.scrollTop && scrollHost.scrollTop <= 0)) {
      return;
    }

    event.preventDefault();
    animatePlannerScrollBy(step * direction);
  }, [animatePlannerScrollBy, screen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleViewportChange = (event) => {
      setIsDesktopView(event.matches);
      if (!event.matches) {
        setShowDesktopFooter(true);
      }
    };

    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, [setShowDesktopFooter]);

  useEffect(() => {
    const scrollHost = contentAreaRef.current;

    if (!scrollHost || screen !== "app" || !isDesktopView) {
      return undefined;
    }

    previousScrollTopRef.current = scrollHost.scrollTop;

    const handleContentScroll = () => {
      const currentScrollTop = scrollHost.scrollTop;
      const delta = currentScrollTop - previousScrollTopRef.current;

      if (Math.abs(delta) < 2) {
        return;
      }

      setShowDesktopFooter(delta > 0);
      previousScrollTopRef.current = currentScrollTop;
    };

    scrollHost.addEventListener("scroll", handleContentScroll, { passive: true });

    return () => {
      scrollHost.removeEventListener("scroll", handleContentScroll);
    };
  }, [isDesktopView, screen, setShowDesktopFooter]);

  useEffect(() => {
    if (screen !== "app") {
      setShowDesktopFooter(true);
    }
  }, [screen, setShowDesktopFooter]);

  useEffect(() => () => {
    stopKeyboardScrollAnimation();
  }, [stopKeyboardScrollAnimation]);

  return {
    contentAreaRef,
    handlePlannerContentKeyDown,
    isDesktopView,
  };
}
