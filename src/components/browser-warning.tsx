"use client";

import { AlertTriangle } from "lucide-react";

export function BrowserWarning() {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm">
        Speech recognition is not supported in this browser. Please use{" "}
        <strong>Google Chrome</strong> for the best experience.
      </p>
    </div>
  );
}
