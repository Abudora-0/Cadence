/** Hover lift for cards. Pair with a `border` so the colour shift reads. */
export const cardHover = {
  whileHover: { y: -3, borderColor: "var(--border-strong)" },
  transition: { type: "spring", stiffness: 320, damping: 26 } as const,
};

/** Press feedback for buttons. */
export const pressable = {
  whileTap: { scale: 0.96 },
  transition: { type: "spring", stiffness: 500, damping: 30 } as const,
};
