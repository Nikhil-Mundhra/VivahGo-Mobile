import { useEffect, useRef } from "react";
import lottie from "lottie-web";

function clampProgress(value) {
  return Math.max(0, Math.min(1, value));
}

export default function ScrollScrubbedLottie({
  animationPath,
  className = "",
  ariaLabel,
  endFrame,
  scrubEasingPower = 1,
}) {
  const sectionRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!animationPath || typeof window === "undefined") {
      return undefined;
    }

    const reduceMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const shouldReduceMotion = Boolean(reduceMotionQuery?.matches);
    let animationFrameId = 0;

    const animation = lottie.loadAnimation({
      container: animationRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: animationPath,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: true,
      },
    });

    function getLastFrame() {
      const animationLastFrame = Math.max(0, (animation.totalFrames || 1) - 1);
      if (Number.isFinite(endFrame)) {
        return Math.max(0, Math.min(animationLastFrame, Number(endFrame)));
      }
      return animationLastFrame;
    }

    function renderFrameFromScroll() {
      animationFrameId = 0;

      if (!sectionRef.current) {
        return;
      }

      if (shouldReduceMotion) {
        animation.goToAndStop(getLastFrame(), true);
        return;
      }

      const rect = sectionRef.current.getBoundingClientRect();
      const scrollDistance = Math.max(1, rect.height - window.innerHeight);
      const progress = clampProgress(-rect.top / scrollDistance);
      const easedProgress = Math.pow(progress, Math.max(0.01, scrubEasingPower));
      animation.goToAndStop(easedProgress * getLastFrame(), true);
    }

    function requestRenderFrame() {
      if (animationFrameId) {
        return;
      }
      animationFrameId = window.requestAnimationFrame(renderFrameFromScroll);
    }

    animation.addEventListener("DOMLoaded", requestRenderFrame);
    animation.addEventListener("data_ready", requestRenderFrame);

    if (!shouldReduceMotion) {
      window.addEventListener("scroll", requestRenderFrame, { passive: true });
      window.addEventListener("resize", requestRenderFrame);
    }

    requestRenderFrame();

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
      animation.removeEventListener("DOMLoaded", requestRenderFrame);
      animation.removeEventListener("data_ready", requestRenderFrame);
      window.removeEventListener("scroll", requestRenderFrame);
      window.removeEventListener("resize", requestRenderFrame);
      animation.destroy();
    };
  }, [animationPath, endFrame, scrubEasingPower]);

  return (
    <div ref={sectionRef} className={`marketing-product-tour-scroll ${className}`.trim()}>
      <div className="marketing-product-tour-sticky">
        <div
          className="marketing-product-tour-frame"
          role="img"
          aria-label={ariaLabel}
        >
          <div ref={animationRef} className="marketing-product-tour-animation" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
