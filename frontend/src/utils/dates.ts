import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), 'yyyy-MM-dd');
};

export const formatDateDisplay = (date: Date | string): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: es });
};

export const formatDateHeader = (date: Date | string): string => {
  const formatted = format(new Date(date), 'EEE d', { locale: es });
  // Capitalizar primera letra del nombre del día
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatMonthYear = (date: Date | string): string => {
  const formatted = format(new Date(date), "MMMM 'de' yyyy", { locale: es });
  // Capitalizar primera letra del mes
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const getMonthRange = (date: Date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

export const getDaysInRange = (start: Date, end: Date): Date[] => {
  return eachDayOfInterval({ start, end });
};

