"use client";

import { useEffect } from "react";

export default function HashScrollHandler() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Rola ao carregar com pequenos atrasos para cobrir hydration e framer-motion
    scrollToHash();
    const t1 = setTimeout(scrollToHash, 100);
    const t2 = setTimeout(scrollToHash, 300);

    window.addEventListener("hashchange", scrollToHash);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return null;
}
