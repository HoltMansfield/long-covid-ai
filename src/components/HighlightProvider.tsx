"use client";
import { useEffect, useRef } from "react";
import { H } from "@highlight-run/next/client";

export default function HighlightProvider({ children }: { children: React.ReactNode }) {
  const lastIdentifiedUser = useRef<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Temporarily disable Highlight.io completely to resolve session data errors
    // TODO: Re-enable once the session data conflict is resolved
    console.log('ℹ️ Highlight.io temporarily disabled to prevent console errors');
    
    // Only initialize once (when we re-enable)
    // if (!isInitialized.current) {
    //   try {
    //     H.init("d0oevl36hees769uqvl0");
    //     isInitialized.current = true;
    //     console.log('✅ Highlight.io initialized');
    //   } catch (error) {
    //     console.warn('⚠️ Highlight.io initialization failed:', error);
    //     return;
    //   }
    // }
    
    return () => {
      // Cleanup placeholder
    };
  }, []); // Empty dependency array - only run once
  
  return <>{children}</>;
}