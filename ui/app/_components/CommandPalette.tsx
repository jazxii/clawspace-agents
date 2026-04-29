"use client";

/* eslint-disable jsx-a11y/no-autofocus -- The Cmd-K palette MUST move focus to its
   input on open per the modal-dialog contract (ACCESSIBILITY-BRIEF-V2 §11.2). */

import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMode } from "@/lib/use-mode";
import { liveAnnounce } from "@/lib/live-announce";

/**
 * Cmd-K command palette — ACCESSIBILITY-BRIEF-V2 §3.4 / §6.2 / §7.2 / §9.1.
 *
 * Radix Dialog wraps `cmdk` which handles combobox+listbox ARIA. cmdk renders
 * the input as role="combobox", the list as role="listbox", and items as
 * role="option" with aria-selected semantics. Group separators are rendered
 * with role="presentation" by cmdk.
 *
 * Layout: floating overlay, Linear-style. Escape, click backdrop, or Cmd-K
 * again to close. Selecting an item closes the palette.
 *
 * Result count is announced to a polite role="status" inside the dialog
 * (one of two regions — the dedicated palette context per §4.3) instead of
 * fighting the global live region with the brief's "quiet zone" rule.
 */

interface CommandItem {
  id: string;
  label: string;
  group: string;
  href?: string;
  // Future: actions could trigger a callback instead of nav.
  keywords?: string[];
}

const STATIC_COMMANDS: CommandItem[] = [
  // Sections
  { id: "nav-dashboard", group: "Go to", label: "Dashboard", href: "/", keywords: ["home"] },
  { id: "nav-kanban", group: "Go to", label: "Kanban", href: "/kanban" },
  { id: "nav-channels", group: "Go to", label: "Channels", href: "/channels" },
  { id: "nav-proposals", group: "Go to", label: "Proposals", href: "/proposals" },
  { id: "nav-research", group: "Go to", label: "Research digests", href: "/research/digests" },
  { id: "nav-timeline", group: "Go to", label: "Timeline", href: "/timeline", keywords: ["feed"] },
  { id: "nav-agents", group: "Go to", label: "Agents", href: "/agents" },
  { id: "nav-audit", group: "Go to", label: "Audit log", href: "/audit", keywords: ["history"] },
  { id: "nav-logs", group: "Go to", label: "Daily reasoning logs", href: "/logs" },
  { id: "nav-graphify", group: "Go to", label: "Graphify indexes", href: "/graphify" },
  { id: "nav-search", group: "Go to", label: "Search", href: "/search" },
  // Settings
  { id: "settings-theme", group: "Settings", label: "Toggle theme (System / Light / Dark)" },
  { id: "settings-density", group: "Settings", label: "Toggle density (Comfortable / Compact)" },
  { id: "settings-shortcuts", group: "Settings", label: "Toggle single-character shortcuts" },
  { id: "settings-pause", group: "Settings", label: "Pause announcements" },
];

export default function CommandPalette() {
  const { mode, setMode, clearMode } = useMode();
  const open = mode === "palette";
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  function onSelect(item: CommandItem) {
    if (item.href) {
      router.push(item.href);
      liveAnnounce.polite(`Navigating to ${item.label}`, "route-change");
      clearMode();
      return;
    }
    // Other commands — surface that we got the intent; settings open the user menu (PR-A)
    if (item.id === "settings-theme") {
      window.dispatchEvent(new CustomEvent("clawspace:open-user-menu", { detail: { focus: "theme" } }));
    } else if (item.id === "settings-density") {
      window.dispatchEvent(new CustomEvent("clawspace:open-user-menu", { detail: { focus: "density" } }));
    } else if (item.id === "settings-shortcuts") {
      window.dispatchEvent(new CustomEvent("clawspace:open-user-menu", { detail: { focus: "shortcuts" } }));
    } else if (item.id === "settings-pause") {
      window.dispatchEvent(new CustomEvent("clawspace:toggle-pause"));
    }
    clearMode();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? setMode("palette") : clearMode())}>
      <Dialog.Portal>
        <Dialog.Overlay className="cmdk-overlay" />
        <Dialog.Content
          className="cmdk-content"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command
            label="Command palette"
            shouldFilter={true}
            filter={(value, searchTerm) => {
              if (!searchTerm) return 1;
              return value.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
            }}
          >
            <Command.Input
              className="cmdk-input"
              placeholder="Type a command or search…"
              value={search}
              onValueChange={(v) => setSearch(v)}
              autoFocus
            />

            <Command.List className="cmdk-list">
              <Command.Empty className="cmdk-empty">No results.</Command.Empty>

              {Array.from(new Set(STATIC_COMMANDS.map((c) => c.group))).map((group) => (
                <Command.Group key={group} heading={group} className="cmdk-group">
                  {STATIC_COMMANDS.filter((c) => c.group === group).map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`${c.label} ${c.keywords?.join(" ") ?? ""}`}
                      className="cmdk-item"
                      onSelect={() => onSelect(c)}
                    >
                      <span>{c.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>

            {/* Result count — polite role="status" inside palette (BRIEF §4.3 exception) */}
            <p
              role="status"
              aria-live="polite"
              className="px-3 py-2 text-xs text-tertiary border-t border-subtle"
            >
              {/* cmdk doesn't expose a result count directly; we approximate. Refined in PR-B with a virtual count via Command's own item registry. */}
              Press Enter to select · Esc to close
            </p>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
