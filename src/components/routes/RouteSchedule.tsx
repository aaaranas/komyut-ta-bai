import type { DayType, Service } from "@/core/transit/types";

const DAY_LABEL: Record<DayType, string> = { weekday: "Weekdays", saturday: "Saturday", sunday: "Sunday" };
const daysLabel = (days: DayType[]) => (days.length === 3 ? "Every day" : days.map((day) => DAY_LABEL[day]).join(" and "));

/** Per-day service windows (frequency services) or departure times (timetabled). */
export default function RouteSchedule({ service }: { service: Service }) {
  const rows =
    service.kind === "frequency"
      ? service.windows.map((window) => ({
          days: daysLabel(window.days),
          detail: window.headway_label,
          time: `${window.start}–${window.end}`,
        }))
      : service.departures.map((set) => ({
          days: daysLabel(set.days),
          detail: `${set.times.length} departures`,
          time: set.times.join(", "),
        }));
  // A single all-week window already appears in the facts above.
  if (rows.length <= 1) return null;
  return (
    <section className="mt-8" aria-labelledby="schedule">
      <h2 id="schedule" className="text-base font-bold">
        Schedule
      </h2>
      <table className="mt-2 w-full border-y text-sm">
        <tbody className="divide-y">
          {rows.map((row, index) => (
            <tr key={`${row.days}-${index}`}>
              <th scope="row" className="py-2.5 text-left font-medium">
                {row.days}
              </th>
              <td className="py-2.5 text-muted-foreground">{row.detail}</td>
              <td className="py-2.5 text-right font-medium tabular-nums">{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
