"use client";
import { useEffect } from "react";
import { H } from "@highlight-run/next/client";

export default function HighlightProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    H.init("d0oevl36hees769uqvl0");
  }, []);
  return <>{children}</>;
}