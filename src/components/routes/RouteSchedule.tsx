import { CalendarClock } from "lucide-react";
import type { DayType, Service } from "@/core/transit/types";

const DAY_LABEL: Record<DayType, string> = { weekday: "Weekdays", saturday: "Saturday", sunday: "Sunday" };
const daysLabel = (days: DayType[]) =>
  days.length === 3 ? "Daily" : days.map((day) => DAY_LABEL[day]).join(" & ");

/** Per-day service windows (frequency services) or departure times (timetabled). */
export default function RouteSchedule({ service }: { service: Service }) {
  const rows =
    service.kind === "frequency"
      ? service.windows.map((window) => ({
          days: daysLabel(window.days),
          detail: window.headway_label,
          time: `${window.start} – ${window.end}`,
        }))
      : service.departures.map((set) => ({
          days: daysLabel(set.days),
          detail: `${set.times.length} departures`,
          time: set.times.join(", "),
        }));
  if (rows.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <CalendarClock className="size-4 text-primary" />
        Schedule
      </h2>
      <div className="mt-3 overflow-hidden rounded-xl border">
        {rows.map((row, index) => (
          <div key={`${row.days}-${index}`} className={`flex items-center justify-between gap-3 px-4 py-3 ${index > 0 ? "border-t" : ""}`}>
            <div>
              <p className="text-sm font-medium text-foreground">{row.days}</p>
              <p className="text-xs text-muted-foreground">{row.detail}</p>
            </div>
            <p className="text-right text-sm font-semibold tabular-nums text-foreground">{row.time}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
