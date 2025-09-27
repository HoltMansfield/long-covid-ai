"use client";
import { useEffect, useRef } from "react";
import { H } from "@highlight-run/next/client";

export default function HighlightProvider({ children }: { children: React.ReactNode }) {
  const lastIdentifiedUser = useRef<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (!isInitialized.current) {
      try {
        H.init("d0oevl36hees769uqvl0");
        isInitialized.current = true;
        console.log('✅ Highlight.io initialized successfully');
      } catch (error) {
        console.warn('⚠️ Highlight.io initialization failed:', error);
        // Don't break the app if Highlight.io fails to initialize
        return;
      }
    }
    
    return () => {
      // Cleanup placeholder
    };
  }, []); // Empty dependency array - only run once
  
  return <>{children}</>;
}