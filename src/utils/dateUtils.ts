import { parse, format, addWeeks, startOfMonth, differenceInDays, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function parseDate(dateString: string) {
  try {
    return parse(dateString, 'd \'de\' MMMM yyyy', new Date(), { locale: es });
  } catch (error) {
    console.error('Error parsing date:', dateString);
    return new Date();
  }
}

export function calculatePosition(date: string, startMonth: string, monthsToDisplay: number): number {
  const parsedDate = parseDate(date);
  const startDate = parse(startMonth, 'MMMM yyyy', new Date(), { locale: es });
  const endDate = addWeeks(startDate, monthsToDisplay * 4);
  
  const totalDays = differenceInDays(endDate, startDate);
  const daysFromStart = differenceInDays(parsedDate, startDate);
  
  const position = (daysFromStart / totalDays) * 100;
  return Math.max(0, Math.min(100, position));
}

export function calculateCurrentDatePosition(currentDate: Date, startMonth: string, monthsToDisplay: number): number {
  const startDate = parse(startMonth, 'MMMM yyyy', new Date(), { locale: es });
  const endDate = addWeeks(startDate, monthsToDisplay * 4);

  if (currentDate < startDate || currentDate > endDate) {
    return -1;
  }

  const totalDays = differenceInDays(endDate, startDate);
  const daysElapsed = differenceInDays(currentDate, startDate);
  
  const position = (daysElapsed / totalDays) * 100;
  return Math.max(0, Math.min(100, position));
}

export function parseProjectDate(dateString: string): Date {
  const parsed = parseDate(dateString);
  return isValid(parsed) ? parsed : new Date();
}

export function formatProjectDate(date: Date): string {
  return format(date, "d 'de' MMMM yyyy", { locale: es });
}