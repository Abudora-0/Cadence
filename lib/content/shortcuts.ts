export interface Shortcut {
  keys: string;
  action: string;
}

/** Shared by the About page and the site footer. */
export const SHORTCUTS: Shortcut[] = [
  { keys: "Tab", action: "Restart the current run with fresh text" },
  { keys: "Esc", action: "Reset back to the start" },
  { keys: "Enter", action: "Finish a Zen run" },
  { keys: "Cmd / Ctrl + K", action: "Open the command bar" },
  { keys: "Shift + T", action: "Cycle through the themes" },
];
