"use client";

/* eslint-disable jsx-a11y/no-autofocus -- Cmd-K palette MUST move focus to its
   input on open per the modal-dialog contract (ACCESSIBILITY-BRIEF-V2 §11.2). */

/**
 * Cmd-K command palette — v3 (Apple-native).
 *
 * Built on cmdk + Radix Dialog. Items are grouped (Navigate / Agents /
 * Actions / Settings) per the design's `shell.jsx::PALETTE_ITEMS`. Stage
 * actions POST to /api/actions/<verb> per UI_v3 plan §7.6 — Phase B
 * leaves the route-handler stubs as no-ops and announces via live-region.
 *
 * Keyboard: ↑↓ navigate, Enter selects, Esc closes.
 * Result-count is announced to a polite role="status" inside the dialog
 * (the palette's quiet-zone exception, ACCESSIBILITY-BRIEF-V2 §4.3).
 */

import * as React from "react";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useMode } from "@/lib/use-mode";
import { liveAnnounce } from "@/lib/live-announce";
import { useTweaks } from "@/lib/use-tweaks";
import { ROUTES } from "@/lib/route-meta";
import { Icon, type IconName } from "./Icon";

type CommandKind = "route" | "stage" | "client";

interface PaletteItem {
  id: string;
  group: "Navigate" | "Agents" | "Actions" | "Settings";
  label: string;
  hint?: string;
  icon: IconName;
  kind: CommandKind;
  href?: string;            // route
  stage?: { verb: string }; // stage
  client?: () => void;      // client (filled in component scope)
  keywords?: string[];
}

export default function CommandPalette() {
  const { mode, setMode, clearMode } = useMode();
  const open = mode === "palette";
  const router = useRouter();
  const [t, setTweak] = useTweaks();
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  // Cmd-K toggle (idle <-> palette). Already handled by the Mode provider's
  // global listener wherever it's wired; if not, register one here.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMode("palette");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMode]);

  const items: PaletteItem[] = React.useMemo(() => {
    const navItems: PaletteItem[] = ROUTES.map((r) => ({
      id: `nav-${r.id}`,
      group: "Navigate",
      label: `Go to ${r.name}`,
      hint: r.id,
      icon: r.icon,
      kind: "route",
      href: r.href,
    }));

    const agentItems: PaletteItem[] = [
      { id: "agent-linkedin",     group: "Agents", label: "Run linkedin-writer",          hint: "sonnet", icon: "linkedin", kind: "stage", stage: { verb: "run-linkedin-writer" } },
      { id: "agent-scrum",        group: "Agents", label: "Run scrum-master",             hint: "opus",   icon: "kanban",   kind: "stage", stage: { verb: "run-scrum-master" } },
      { id: "agent-notebooklm",   group: "Agents", label: "Run notebooklm-bridge",        hint: "sonnet", icon: "spark",    kind: "stage", stage: { verb: "run-notebooklm-bridge" } },
      { id: "agent-content-sup",  group: "Agents", label: "Run daily-content-supervisor", hint: "sonnet", icon: "queue",    kind: "stage", stage: { verb: "run-daily-content-supervisor" } },
    ];

    const actionItems: PaletteItem[] = [
      { id: "act-new-project",    group: "Actions", label: "New project (/new-project)",       hint: "⌘N", icon: "plus",   kind: "route", href: "/new-project" },
      { id: "act-apply-proposal", group: "Actions", label: "Apply proposal (week-NN)",         hint: "⏎",  icon: "check",  kind: "client", client: () => liveAnnounce.polite("Run /apply-proposal week-NN from Claude Code — apply is gated to the CLI per CLAUDE.md.", "form-feedback") },
      { id: "act-sync-notion",    group: "Actions", label: "Sync content queue → Notion",      hint: "⇧⌘S",icon: "notion", kind: "stage",  stage: { verb: "sync-content-to-notion" } },
      { id: "act-newsletter",     group: "Actions", label: "Compose Wk-NN newsletter draft",   hint: "",   icon: "mail",   kind: "stage",  stage: { verb: "compose-newsletter" } },
    ];

    const settingsItems: PaletteItem[] = [
      { id: "set-theme",   group: "Settings", label: "Toggle theme",       hint: "⌘⇧L", icon: "sun",     kind: "client", client: () => setTweak("theme", t.theme === "dark" ? "light" : "dark") },
      { id: "set-tweaks",  group: "Settings", label: "Open Tweaks panel",  hint: "⌘.",  icon: "palette", kind: "client", client: () => window.dispatchEvent(new Event("clawspace:open-tweaks")) },
    ];

    return [...navItems, ...agentItems, ...actionItems, ...settingsItems];
  }, [setTweak, t.theme]);

  async function handleStage(verb: string, label: string) {
    try {
      const res = await fetch(`/api/actions/${verb}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": `${verb}:${Math.floor(Date.now() / 60_000)}`,
        },
        body: JSON.stringify({ source: "command-palette" }),
      });
      if (res.ok) {
        liveAnnounce.polite(`${label} queued`, "form-feedback");
      } else {
        liveAnnounce.assertive(`${label} failed: ${res.status}`);
      }
    } catch {
      liveAnnounce.assertive(`${label} failed: network error`);
    }
  }

  function onSelect(item: PaletteItem) {
    if (item.kind === "route" && item.href) {
      router.push(item.href);
      liveAnnounce.polite(`Navigating to ${item.label}`, "route-change");
    } else if (item.kind === "stage" && item.stage) {
      void handleStage(item.stage.verb, item.label);
    } else if (item.kind === "client" && item.client) {
      item.client();
    }
    clearMode();
  }

  const groups = ["Navigate", "Agents", "Actions", "Settings"] as const;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => (o ? setMode("palette") : clearMode())}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="cs-palette-scrim" />
        <Dialog.Content className="cs-palette" aria-describedby={undefined}>
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
              placeholder="Type a command or search…"
              value={search}
              onValueChange={(v) => setSearch(v)}
              autoFocus
            />
            <Command.List className="cs-palette-list">
              <Command.Empty className="cs-palette-grp" style={{ padding: 18, textAlign: "center" }}>
                No matches
              </Command.Empty>

              {groups.map((g) => {
                const groupItems = items.filter((i) => i.group === g);
                if (groupItems.length === 0) return null;
                return (
                  <Command.Group key={g} heading={g} className="cs-palette-grp">
                    {groupItems.map((it) => (
                      <Command.Item
                        key={it.id}
                        value={`${it.label} ${it.hint ?? ""} ${it.id}`}
                        className="cs-palette-row"
                        onSelect={() => onSelect(it)}
                      >
                        <span className="ico"><Icon name={it.icon} size={13} /></span>
                        <span className="ttl">{it.label}</span>
                        {it.hint && <span className="hint">{it.hint}</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                );
              })}
            </Command.List>

            <p
              role="status"
              aria-live="polite"
              className="muted"
              style={{ fontSize: 11, padding: "6px var(--pad-3)", borderTop: ".5px solid var(--hairline)" }}
            >
              Press <kbd className="cs-kbd">⏎</kbd> to select · <kbd className="cs-kbd">Esc</kbd> to close
            </p>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
