import { format, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";

export const formatDate = (date: Date | string): string => {
  // Si es un string ISO, extraer directamente la parte de la fecha (YYYY-MM-DD)
  // para evitar problemas de zona horaria
  if (typeof date === "string" && date.includes("T")) {
    return date.split("T")[0];
  }
  // Si es un Date, extraer año, mes y día directamente para evitar problemas de zona horaria
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // Si es un string YYYY-MM-DD, devolverlo tal cual
  if (typeof date === "string") {
    return date;
  }
  // Fallback: usar format de date-fns
  return format(new Date(date), "yyyy-MM-dd");
};

export const formatDateDisplay = (date: Date | string): string => {
  // Si es un string YYYY-MM-DD, convertir directamente sin pasar por Date para evitar zona horaria
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }
  // Si es un Date, extraer año, mes y día directamente
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  }
  // Fallback: usar format de date-fns
  return format(new Date(date), "dd/MM/yyyy", { locale: es });
};

export const formatDateHeader = (date: Date | string): string => {
  const formatted = format(new Date(date), "EEE d", { locale: es });
  // Capitalizar primera letra del nombre del día
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatMonthYear = (date: Date | string): string => {
  const formatted = format(new Date(date), "MMMM 'de' yyyy", { locale: es });
  // Capitalizar primera letra del mes
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const getMonthRange = (date: Date = new Date()) => {
  // Crear fechas explícitamente para evitar problemas de zona horaria
  const year = date.getFullYear();
  const month = date.getMonth();

  // Inicio del mes: día 1 a las 00:00:00
  const start = new Date(year, month, 1, 0, 0, 0, 0);

  // Fin del mes: último día del mes a las 23:59:59.999
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = new Date(year, month, lastDay, 23, 59, 59, 999);

  return {
    start,
    end,
  };
};

export const getDaysInRange = (start: Date, end: Date): Date[] => {
  return eachDayOfInterval({ start, end });
};
