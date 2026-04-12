"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { stopProgress } from "@/components/top-loader";

/**
 * A small helper component to be placed inside any <form>.
 * It detects when a Server Action (or any form submission) finishes 
 * and stops the global top-loading progress bar.
 */
export function FormProgress() {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);

  useEffect(() => {
    // If it was pending and now it's not, the action is finished.
    if (wasPending.current && !pending) {
      stopProgress();
    }
    wasPending.current = pending;
  }, [pending]);

  return null;
}
