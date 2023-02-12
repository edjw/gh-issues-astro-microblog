export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-gb", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
  });
}
