export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getSkills(skills) {
  if (Array.isArray(skills)) return skills.filter(Boolean);
  return String(skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function formatSkills(skills) {
  if (skills == null || skills === "") return "—";
  if (Array.isArray(skills)) return skills.length ? skills.join(", ") : "—";
  if (typeof skills === "string") return skills || "—";
  try {
    return JSON.stringify(skills);
  } catch {
    return "—";
  }
}
