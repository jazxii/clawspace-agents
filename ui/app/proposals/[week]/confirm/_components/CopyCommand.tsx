"use client";

import { useState } from "react";

/**
 * Copy command — preserves accessible name across state change (per ACCESSIBILITY-BRIEF §4).
 * Uses aria-label so SR users hear "Copy command" before AND after the click; the visible
 * text changes to "Copied" but the accessible name stays stable.
 */
export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      const polite = document.getElementById("live-region-polite");
      if (polite) {
        polite.textContent = "";
        requestAnimationFrame(() => {
          polite.textContent = "Command copied to clipboard";
        });
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — user can select the pre block manually
    }
  }

  return (
    <div className="space-y-2">
      <pre tabIndex={0} className="overflow-auto rounded bg-slate-900 p-3 text-sm text-slate-100">
        <code>{command}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy command to clipboard"
        className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
      >
        {copied ? "Copied" : "Copy command"}
      </button>
    </div>
  );
}
