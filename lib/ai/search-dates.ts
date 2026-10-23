// Inventory timestamps are stored as instants; admin calendar dates use Kyiv.
export const INVENTORY_TIME_ZONE = "Europe/Kyiv";
const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: INVENTORY_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});
function parts(date: Date) {
  return Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
}
export function inventoryToday(now = new Date()) {
  const value = parts(now);
  return `${value.year}-${value.month}-${value.day}`;
}
export function inventoryDayStart(day: string) {
  const target = Date.parse(`${day}T00:00:00.000Z`);
  let instant = target;
  for (let i = 0; i < 3; i++) {
    const value = parts(new Date(instant));
    const local = Date.parse(`${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}:${value.second}.000Z`);
    const next = target - (local - instant);
    if (next === instant) break;
    instant = next;
  }
  return new Date(instant);
}

const timestampFormatter = new Intl.DateTimeFormat("uk-UA", { timeZone: INVENTORY_TIME_ZONE, dateStyle: "short", timeStyle: "short" });
export function inventoryTimestamp(value: Date | undefined) {
  return value ? timestampFormatter.format(value) : "Не вказано";
}

// Precompute ordinary calendar ranges so the planner need not do date arithmetic.
export function inventoryDateContext(now = new Date()) {
  const today = inventoryToday(now);
  const shift = (day: string, count: number) => {
    const value = new Date(`${day}T12:00:00.000Z`);
    value.setUTCDate(value.getUTCDate() + count);
    return value.toISOString().slice(0, 10);
  };
  const weekday = new Date(`${today}T12:00:00.000Z`).getUTCDay();
  const monday = shift(today, -((weekday + 6) % 7));
  const month = `${today.slice(0, 7)}-01`;
  const nextMonth = `${shift(month, 32).slice(0, 7)}-01`;
  const lastMonth = `${shift(month, -1).slice(0, 7)}-01`;
  return { currentDate: today, timeZone: INVENTORY_TIME_ZONE, dateRanges: {
    today: { from: today, before: shift(today, 1) },
    yesterday: { from: shift(today, -1), before: today },
    thisWeek: { from: monday, before: shift(monday, 7) },
    lastWeek: { from: shift(monday, -7), before: monday },
    thisMonth: { from: month, before: nextMonth },
    lastMonth: { from: lastMonth, before: month },
  } };
}
