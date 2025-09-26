import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { isNullish } from 'remeda';
import { fi } from 'date-fns/locale';

export const isInRange = (
  current: Date | string | number,
  start?: Date | string | number,
  end?: Date | string | number,
) => {
  return (
    (isNullish(start) || isAfter(current, start)) &&
    (isNullish(end) || isBefore(current, end))
  );
};

export const toFinnishDate = (date: Date) =>
  new TZDate(date, 'Europe/Helsinki');

export const isTimestamp = (x?: string) =>
  x && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(x);

export function timeFromNow(
  value: number | Date | string | null | undefined,
): string {
  if (isNullish(value)) {
    return '';
  }
  return formatDistanceToNow(new Date(value), { locale: fi });
}
