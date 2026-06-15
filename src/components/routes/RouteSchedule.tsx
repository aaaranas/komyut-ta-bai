import { CalendarClock } from "lucide-react";
import type { ServiceWindow } from "@/lib/types";

export default function RouteSchedule({
  schedule,
}: {
  schedule: ServiceWindow[];
}) {
  return (
    <section className="mt-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <CalendarClock className="size-4 text-primary" />
        Schedule
      </h2>
      <div className="mt-3 overflow-hidden rounded-xl border">
        {schedule.map((window, index) => (
          <div
            key={window.days}
            className={`flex items-center justify-between gap-3 px-4 py-3 ${
              index > 0 ? "border-t" : ""
            }`}
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {window.days}
              </p>
              <p className="text-xs text-muted-foreground">
                {window.frequency}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {window.first_trip} – {window.last_trip}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
