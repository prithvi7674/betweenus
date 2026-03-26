import { type CycleCalendarDay } from "@/components/cycle/cycleInsights";

interface CycleCalendarProps {
  monthLabel: string;
  weekDays: string[];
  days: Array<CycleCalendarDay | null>;
}

export function CycleCalendar({
  monthLabel,
  weekDays,
  days,
}: CycleCalendarProps) {
  if (days.length === 0) {
    return (
      <p className="muted">
        Add your cycle details to see the monthly calendar and predictions.
      </p>
    );
  }

  return (
    <div className="cycle-month-card">
      <h3 className="cycle-month-label">{monthLabel}</h3>

      <div className="cycle-weekdays">
        {weekDays.map((day) => (
          <span key={day} className="cycle-weekday">
            {day}
          </span>
        ))}
      </div>

      <div className="cycle-calendar-grid">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="cycle-empty-cell" />;
          }

          return (
            <div
              key={day.isoDate}
              className={`cycle-calendar-cell${day.isPeriod ? " is-period" : ""}${day.isOvulation ? " is-ovulation" : ""}${day.isToday ? " is-today" : ""}`}
            >
              {day.dayNumber}
            </div>
          );
        })}
      </div>

      <div className="cycle-legend">
        <div className="cycle-legend-item">
          <span className="cycle-legend-dot period" />
          <span>Period</span>
        </div>
        <div className="cycle-legend-item">
          <span className="cycle-legend-dot ovulation" />
          <span>Ovulation</span>
        </div>
        <div className="cycle-legend-item">
          <span className="cycle-legend-dot today" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
