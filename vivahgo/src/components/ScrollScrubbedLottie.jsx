import { useEffect, useRef } from "react";
import lottie from "lottie-web";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    let scrubTween;
    let initialized = false;

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

    function initializeScrollScrub() {
      if (initialized || !sectionRef.current) {
        return;
      }

      initialized = true;

      if (shouldReduceMotion) {
        animation.goToAndStop(getLastFrame(), true);
        return;
      }

      const playhead = { progress: 0 };
      const easingPower = Math.max(0.01, scrubEasingPower);
      scrubTween = gsap.to(playhead, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
        onUpdate: () => {
          const easedProgress = Math.pow(playhead.progress, easingPower);
          animation.goToAndStop(easedProgress * getLastFrame(), true);
        },
      });
    }

    animation.addEventListener("DOMLoaded", initializeScrollScrub);
    animation.addEventListener("data_ready", initializeScrollScrub);
    initializeScrollScrub();

    return () => {
      scrubTween?.scrollTrigger?.kill();
      scrubTween?.kill();
      animation.removeEventListener("DOMLoaded", initializeScrollScrub);
      animation.removeEventListener("data_ready", initializeScrollScrub);
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
