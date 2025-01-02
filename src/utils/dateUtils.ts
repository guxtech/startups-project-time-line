import {
  parse,
  format,
  addWeeks,
  differenceInDays,
  isValid,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";

export function parseDate(dateString: string) {
  try {
    if (dateString.includes("T")) {
      return parseISO(dateString);
    }
    return parse(dateString, "d 'de' MMMM yyyy", new Date(), { locale: es });
  } catch {
    console.error("Error parsing date:", dateString);
    return new Date();
  }
}

export function calculatePosition(
  date: string,
  startMonth: string,
  monthsToDisplay: number
): number {
  const parsedDate = parseDate(date);
  const startDate = parse(startMonth, "MMMM yyyy", new Date(), { locale: es });
  const endDate = addWeeks(startDate, monthsToDisplay * 4);

  if (!isValid(parsedDate) || !isValid(startDate)) {
    console.error("Invalid date:", { date, startMonth });
    return 0;
  }

  const totalDays = differenceInDays(endDate, startDate);
  const daysFromStart = differenceInDays(parsedDate, startDate);

  const position = (daysFromStart / totalDays) * 100;
  return Math.max(0, Math.min(100, position));
}

export function calculateCurrentDatePosition(
  currentDate: Date | string,
  startMonth: string,
  monthsToDisplay: number
): number {
  const parsedCurrentDate =
    typeof currentDate === "string" ? parseDate(currentDate) : currentDate;
  const startDate = parse(startMonth, "MMMM yyyy", new Date(), { locale: es });
  const endDate = addWeeks(startDate, monthsToDisplay * 4);

  if (!isValid(parsedCurrentDate) || !isValid(startDate)) {
    console.error("Invalid date:", { currentDate, startMonth });
    return -1;
  }

  if (parsedCurrentDate < startDate || parsedCurrentDate > endDate) {
    return -1;
  }

  const totalDays = differenceInDays(endDate, startDate);
  const daysElapsed = differenceInDays(parsedCurrentDate, startDate);

  const position = (daysElapsed / totalDays) * 100;
  return Math.max(0, Math.min(100, position));
}

export function parseProjectDate(dateString: string): Date {
  const parsed = parseDate(dateString);
  return isValid(parsed) ? parsed : new Date();
}

export function formatProjectDate(date: Date | string): string {
  const parsedDate = typeof date === "string" ? parseDate(date) : date;
  return format(parsedDate, "d 'de' MMMM yyyy", { locale: es });
}
