"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProposalDiff } from "@/lib/fs-adapter";

/**
 * Proposal review form — implements ACCESSIBILITY-BRIEF §4.
 *
 * Each diff is a checkbox + label, with rationale/risk/reversibility associated via
 * aria-describedby. Submit-with-zero focuses the first checkbox and announces an
 * inline role="alert" + assertive live region.
 *
 * Submit navigates to /proposals/[week]/confirm with the selection in query string.
 * Confirm page shows the exact CLI command — no auto-apply (per CLAUDE.md).
 */
export default function ProposalReviewForm({
  week,
  diffs,
  applied,
}: {
  week: string;
  diffs: ProposalDiff[];
  applied: boolean;
}) {
  const router = useRouter();
  const formId = useId();
  const errorId = `${formId}-error`;
  const fieldsetRef = useRef<HTMLFieldSetElement | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showError, setShowError] = useState(false);

  function toggle(n: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
    if (showError) setShowError(false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected.size === 0) {
      setShowError(true);
      // Announce assertively
      const a = document.getElementById("live-region-assertive");
      if (a) {
        a.textContent = "";
        requestAnimationFrame(() => {
          a.textContent = "Select at least one change to continue.";
        });
      }
      // Move focus to the first checkbox
      const first = fieldsetRef.current?.querySelector<HTMLInputElement>(
        'input[type="checkbox"]',
      );
      first?.focus();
      return;
    }
    const list = [...selected].sort((a, b) => a - b).join(",");
    router.push(`/proposals/${week}/confirm?select=${encodeURIComponent(list)}`);
  }

  if (applied) {
    return (
      <p className="rounded border border-slate-200 bg-slate-50 p-4">
        This proposal has been applied. Use <code>/rollback-proposal {week}</code> if you need
        to revert.
      </p>
    );
  }

  if (diffs.length === 0) {
    return (
      <p className="rounded border border-slate-200 bg-slate-50 p-4">
        This proposal contains no parseable diffs. Open the markdown file directly to review.
      </p>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      aria-labelledby="diffs-h"
      aria-describedby={`${formId}-help`}
    >
      <h2 id="diffs-h" className="text-lg font-semibold mb-2">
        Proposed changes
      </h2>
      <p id={`${formId}-help`} className="text-sm text-slate-600 mb-4">
        Select the changes you want to apply, then submit. You'll see a confirmation step
        before any command runs.
      </p>

      <fieldset ref={fieldsetRef} aria-describedby={showError ? errorId : undefined}>
        <legend className="sr-only">Diff selections</legend>

        <div className="space-y-4">
          {diffs.map((d) => {
            const cbId = `diff-${d.n}`;
            return (
              <div key={d.n} className="rounded border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={cbId}
                    name="apply"
                    value={d.n}
                    checked={selected.has(d.n)}
                    onChange={() => toggle(d.n)}
                    aria-describedby={`${cbId}-rationale ${cbId}-risk ${cbId}-rev`}
                    className="mt-1 h-5 w-5"
                  />
                  <label htmlFor={cbId} className="font-medium">
                    <strong>Diff {d.n}:</strong> {d.title}
                  </label>
                </div>
                <dl className="mt-2 ml-8 text-sm space-y-1">
                  {d.file && (
                    <div className="flex gap-2">
                      <dt className="font-medium">File:</dt>
                      <dd>
                        <code>{d.file}</code>
                      </dd>
                    </div>
                  )}
                  {d.type && (
                    <div className="flex gap-2">
                      <dt className="font-medium">Type:</dt>
                      <dd>{d.type}</dd>
                    </div>
                  )}
                  {d.reversibility && (
                    <div className="flex gap-2">
                      <dt className="font-medium">Reversibility:</dt>
                      <dd id={`${cbId}-rev`}>{d.reversibility}</dd>
                    </div>
                  )}
                  {d.rationale && (
                    <div className="flex gap-2">
                      <dt className="font-medium">Rationale:</dt>
                      <dd id={`${cbId}-rationale`}>{d.rationale}</dd>
                    </div>
                  )}
                  {d.risk && (
                    <div className="flex gap-2">
                      <dt className="font-medium">Risk:</dt>
                      <dd id={`${cbId}-risk`}>{d.risk}</dd>
                    </div>
                  )}
                </dl>
                {d.diff && (
                  <pre
                    tabIndex={0}
                    className="mt-3 ml-8 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100"
                  >
                    <code>{d.diff}</code>
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>

      {showError && (
        <p id={errorId} role="alert" className="mt-3 text-sm text-[#7f1d1d]">
          Select at least one change to continue.
        </p>
      )}

      <p aria-live="polite" id={`${formId}-count`} className="mt-4 text-sm text-slate-600">
        {selected.size} of {diffs.length} {diffs.length === 1 ? "change" : "changes"} selected
      </p>

      <div role="group" aria-labelledby="actions-h" className="mt-4 flex gap-3">
        <h2 id="actions-h" className="sr-only">
          Actions
        </h2>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Review selected and continue
        </button>
        <a
          href="/proposals"
          className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
