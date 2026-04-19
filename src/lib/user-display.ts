/** Iniciais para avatar (máx. 2 caracteres). */
export function getInitials(displayName: string): string {
  const t = displayName.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]!.slice(0, 1) + parts[parts.length - 1]!.slice(0, 1)).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

export function roleLabel(role: "USER" | "ADMIN"): string {
  return role === "ADMIN" ? "Administrador" : "Cliente";
}
