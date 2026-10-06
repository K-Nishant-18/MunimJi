import { useEffect, useRef, useState } from "react";

const SPLASH_MS = 6200;
const FADE_MS = 500;

export default function Splash() {
  const videoRef = useRef(null);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (gone) return;
    document.documentElement.style.overflow = "hidden";
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
    const fadeTimer = setTimeout(() => setFading(true), SPLASH_MS);
    const goneTimer = setTimeout(() => setGone(true), SPLASH_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
      document.documentElement.style.overflow = "";
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        src="/MunimJi-loader.mp4"
        className="w-[min(76vw,440px)]"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setFading(true)}
      />
    </div>
  );
}
