export function list(items) {
  return items
    .map((item, i) => (i == items.length - 1 ? "and " + item : item))
    .join(", ");
}
