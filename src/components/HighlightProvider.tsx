"use client";
import { useEffect } from "react";
import { H } from "@highlight-run/next/client";

export default function HighlightProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    H.init("ney02ovd");
  }, []);
  return <>{children}</>;
}