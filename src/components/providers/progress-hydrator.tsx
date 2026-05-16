"use client";

import { useEffect } from "react";
import { progressStore } from "@/lib/progress-store";

export function ProgressHydrator() {
  useEffect(() => {
    progressStore.hydrate();
  }, []);
  return null;
}
