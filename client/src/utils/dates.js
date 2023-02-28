import { parseISO } from "date-fns";

/**
 * @param {Date|string} datetime
 */
export function toLocaleString(datetime) {
  return (
    datetime &&
    (typeof datetime == "string"
      ? parseISO(datetime)
      : datetime
    ).toLocaleString("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
      hourCycle: "h23",
    })
  );
}
