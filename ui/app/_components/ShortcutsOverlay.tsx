"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMode } from "@/lib/use-mode";
import { useGlobalShortcuts } from "@/lib/use-shortcuts";

/**
 * Keyboard shortcuts overlay — opened by `?`. ACCESSIBILITY-BRIEF-V2 §6.1 + §9.
 * Modal Dialog (Radix). The toggle for disabling single-character shortcuts
 * lives here per WCAG 2.1.4 mandate.
 */

const SECTIONS = [
  {
    title: "Navigation",
    rows: [
      ["⌘ K  /  Ctrl K", "Open command palette"],
      ["g d", "Go to Dashboard"],
      ["g k", "Go to Kanban"],
      ["g c", "Go to Channels"],
      ["g p", "Go to Proposals"],
      ["g r", "Go to Research"],
      ["g t", "Go to Timeline (PR-B)"],
      ["g a", "Go to Agents (PR-B)"],
      ["g u", "Go to Audit (PR-B)"],
      ["g l", "Go to Logs (PR-B)"],
      ["g s", "Open Search (PR-B)"],
    ],
  },
  {
    title: "Lists & boards",
    rows: [
      ["↑ / ↓", "Move active item"],
      ["Home / End", "First / last item"],
      ["Enter / Space", "Open detail"],
      ["m", "Pick up Kanban card (move mode)"],
      ["← / →", "Move card across columns (in move mode)"],
      ["j / k", "Next / previous (timeline, channel history) — PR-B"],
    ],
  },
  {
    title: "Misc",
    rows: [
      ["?", "Open this overlay"],
      ["Esc", "Close current overlay / mode"],
      ["/", "Slash command picker (in textareas) — PR-C"],
    ],
  },
];

export default function ShortcutsOverlay() {
  const { mode, clearMode, setMode } = useMode();
  const open = mode === "shortcuts-overlay";
  const { disabled, setShortcutsDisabled } = useGlobalShortcuts();

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? setMode("shortcuts-overlay") : clearMode())}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(640px,calc(100vw-32px))] max-h-[80vh] overflow-auto rounded-lg p-6 shadow-2xl"
          style={{
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-default)",
          }}
        >
          <Dialog.Title className="text-xl font-semibold mb-1">Keyboard shortcuts</Dialog.Title>
          <Dialog.Description className="text-sm text-secondary mb-4">
            Press <span className="kbd">Esc</span> to close.
          </Dialog.Description>

          <div className="space-y-5">
            {SECTIONS.map((section) => (
              <section key={section.title} aria-labelledby={`shortcut-${section.title}`}>
                <h3 id={`shortcut-${section.title}`} className="font-semibold mb-2">
                  {section.title}
                </h3>
                <table className="w-full text-sm">
                  <caption className="sr-only">{section.title} shortcuts</caption>
                  <tbody>
                    {section.rows.map(([keys, description]) => (
                      <tr key={keys}>
                        <th scope="row" className="text-left py-1 pr-4 font-normal" style={{ width: "12rem" }}>
                          <span className="kbd">{keys}</span>
                        </th>
                        <td className="py-1">{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}

            <fieldset className="border-t border-subtle pt-4">
              <legend className="font-semibold">Single-character shortcuts</legend>
              <p className="text-sm text-secondary mt-1">
                WCAG 2.1.4 — turn off single-character shortcuts (g d, j, k, m, /, ?) if they conflict with your assistive tech.
              </p>
              <label className="inline-flex items-center gap-2 mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={disabled}
                  onChange={(e) => setShortcutsDisabled(e.currentTarget.checked)}
                />
                Disable single-character shortcuts
              </label>
            </fieldset>
          </div>

          <div className="mt-6 flex justify-end">
            <Dialog.Close asChild>
              <button className="btn-secondary">Close</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
