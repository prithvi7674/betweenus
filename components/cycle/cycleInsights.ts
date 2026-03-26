import { type CycleSettings } from "@/firebase/firestore";

export type CyclePhase =
  | "Menstrual Phase"
  | "Follicular Phase"
  | "Ovulation"
  | "Luteal Phase";

export interface CycleCalendarDay {
  isoDate: string;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  isPeriod: boolean;
  isOvulation: boolean;
}

export interface CyclePrediction {
  currentPhase: CyclePhase | null;
  currentDay: number | null;
  nextPeriodDays: number | null;
  nextPeriodDate: string | null;
  phaseInfo: string;
  careSuggestions: string[];
  monthLabel: string;
  weekDays: string[];
  calendarDays: Array<CycleCalendarDay | null>;
}

const PERIOD_LENGTH_DAYS = 5;
const OVULATION_START_DAY = 14;
const OVULATION_END_DAY = 16;
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`);
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function differenceInDays(from: Date, to: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / msPerDay);
}

function formatIsoDate(date: Date) {
  return startOfDay(date).toISOString().split("T")[0];
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getCycleDay(lastPeriodDate: Date, today: Date, cycleLength: number) {
  const daysSinceLastPeriod = differenceInDays(lastPeriodDate, today);

  if (daysSinceLastPeriod < 0) {
    return 1;
  }

  return (daysSinceLastPeriod % cycleLength) + 1;
}

function getCurrentPhase(currentDay: number): CyclePhase {
  if (currentDay >= 1 && currentDay <= 5) {
    return "Menstrual Phase";
  }

  if (currentDay >= 6 && currentDay <= 13) {
    return "Follicular Phase";
  }

  if (currentDay >= 14 && currentDay <= 16) {
    return "Ovulation";
  }

  return "Luteal Phase";
}

function getPhaseInfo(phase: CyclePhase) {
  switch (phase) {
    case "Menstrual Phase":
      return "Rest and gentleness can help your body feel supported.";
    case "Follicular Phase":
      return "Energy often starts to rise, making this a lighter, clearer phase.";
    case "Ovulation":
      return "You may feel brighter and more social around this window.";
    case "Luteal Phase":
      return "Slow rituals, nourishment, and extra care can go a long way here.";
  }
}

function getCareSuggestions(phase: CyclePhase) {
  switch (phase) {
    case "Menstrual Phase":
      return ["Stay hydrated 💧", "Choose rest or gentle stretching 🧘‍♀️"];
    case "Follicular Phase":
      return ["Try a short walk or light workout ✨", "Plan creative work while energy builds 🌸"];
    case "Ovulation":
      return ["Eat well and support your energy 🌼", "Enjoy fresh air and movement if it feels good ☀️"];
    case "Luteal Phase":
      return ["Prioritize sleep and calming rituals 🌙", "Warm meals and soft movement can help 🤍"];
  }
}

function buildCalendar(
  referenceDate: Date,
  lastPeriodDate: Date,
  cycleLength: number,
): Array<CycleCalendarDay | null> {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = firstDayOfMonth.getDay();
  const todayIso = formatIsoDate(referenceDate);

  const calendar: Array<CycleCalendarDay | null> = Array.from(
    { length: leadingEmptyDays },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const isoDate = formatIsoDate(date);
    const cycleDay = getCycleDay(lastPeriodDate, date, cycleLength);

    calendar.push({
      isoDate,
      dayNumber: day,
      isToday: isoDate === todayIso,
      isCurrentMonth: true,
      isPeriod: cycleDay >= 1 && cycleDay <= PERIOD_LENGTH_DAYS,
      isOvulation: cycleDay >= OVULATION_START_DAY && cycleDay <= OVULATION_END_DAY,
    });
  }

  return calendar;
}

export function predictCycle(settings: CycleSettings | null): CyclePrediction {
  const today = startOfDay(new Date());
  const monthLabel = today.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  if (!settings) {
    return {
      currentPhase: null,
      currentDay: null,
      nextPeriodDays: null,
      nextPeriodDate: null,
      phaseInfo: "Add your cycle details to see predictions and a personalized calendar.",
      careSuggestions: [],
      monthLabel,
      weekDays: WEEK_DAYS,
      calendarDays: [],
    };
  }

  const lastPeriodDate = parseDate(settings.lastPeriodDate);
  const currentDay = getCycleDay(lastPeriodDate, today, settings.cycleLength);
  const currentPhase = getCurrentPhase(currentDay);
  const nextPeriodDays = settings.cycleLength - currentDay;
  const nextPeriodDate = addDays(today, nextPeriodDays);

  return {
    currentPhase,
    currentDay,
    nextPeriodDays,
    nextPeriodDate: formatDisplayDate(nextPeriodDate),
    phaseInfo: getPhaseInfo(currentPhase),
    careSuggestions: getCareSuggestions(currentPhase),
    monthLabel,
    weekDays: WEEK_DAYS,
    calendarDays: buildCalendar(today, lastPeriodDate, settings.cycleLength),
  };
}
