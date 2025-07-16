// useScreenInfo.ts
import { useEffect, useState } from "react";

export function useScreenInfo() {
  const getInfo = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation:
      window.innerWidth > window.innerHeight ? "landscape" : "portrait",
    isTablet: window.innerWidth <= 1024,
    isKiosk: window.innerWidth >= 1920,
  });

  const [info, setInfo] = useState(getInfo);

  useEffect(() => {
    const handleResize = () => {
      setInfo(getInfo());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return info;
}
