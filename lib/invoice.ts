const DELIVERY_LINE_ITEM_NAMES = new Set(["Delivery", "Transport"]);

export function isDeliveryItem(name: string): boolean {
  return DELIVERY_LINE_ITEM_NAMES.has(name);
}

export function naira(amountInNaira: number): string {
  return `₦${amountInNaira.toLocaleString("en-NG")}`;
}

export function toKobo(amountInNaira: number): number {
  return Math.round(amountInNaira * 100);
}

export function toNaira(amountInKobo: number): number {
  return amountInKobo / 100;
}

export function formatTime(date: Date): string {
  const d = new Date(date);
  let hours = d.getHours() % 12;
  if (hours === 0) hours = 12;
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDateLong(date: Date): string {
  const d = new Date(date);
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTimeAmPm(date: Date): string {
  const d = new Date(date);
  let hours = d.getHours() % 12;
  if (hours === 0) hours = 12;
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const period = d.getHours() < 12 ? "AM" : "PM";
  return `${hours}:${minutes} ${period}`;
}
