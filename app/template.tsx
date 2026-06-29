// Re-mounts on every navigation, so each page gets a smooth fade-in. Kept to
// opacity only (no transform) so it never interferes with sticky/fixed UI.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
