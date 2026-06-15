import type { Route, ServiceWindow } from "@/lib/types";

const seq = (ids: string[]) =>
  ids.map((stop_id, index) => ({ stop_id, sequence: index + 1 }));

const FARE_50 = { base_fare: 50, flat: true as const, discounted_fare: 40 };
const FARE_30 = { base_fare: 30, flat: true as const, discounted_fare: 25 };
const FREE = { base_fare: 0, flat: true as const };

const everyFew = "every 5–20 min";
const every20 = "every 20 min";
const every30 = "every 30 min";

const sched = (
  rows: [days: string, first: string, last: string, freq: string][]
): ServiceWindow[] =>
  rows.map(([days, first_trip, last_trip, frequency]) => ({
    days,
    first_trip,
    last_trip,
    frequency,
  }));

const BASE = {
  mode: "mybus" as const,
  operator: "MyBus",
  verified_date: "2026-06-15",
};

export const myBusRoutes: Route[] = [
  // ── Route 1 ──
  {
    ...BASE,
    id: "mybus-r1-southbound",
    name: "MyBus Route 1 · Anjo World → Parkmall (via SRP)",
    fare: FARE_50,
    duration_mins: 80,
    frequency_mins: 10,
    first_trip: "05:20",
    last_trip: "21:00",
    schedule: sched([
      ["Weekdays", "05:20", "21:00", everyFew],
      ["Saturday", "05:20", "21:00", everyFew],
      ["Sunday", "06:00", "21:00", everyFew],
    ]),
    stops: seq([
      "mybus-anjo-world", "mybus-aa-bbq-calajoan", "mybus-don-macchiatos-lipata",
      "mybus-jlc-building-linao", "mybus-toyota-talisay", "mybus-talisay-city-hall",
      "mybus-san-isidro", "mybus-dawis", "mybus-carmen", "mybus-cansojong",
      "mybus-rabaya", "mybus-laray", "mybus-il-corso-srp", "mybus-nustar",
      "mybus-malacanang-sa-sugbo", "mybus-robinsons-galleria", "mybus-sm-city-cebu",
      "mybus-uc-med", "mybus-chong-hua-hospital", "mybus-harrison-park", "mybus-parkmall",
    ]),
  },
  {
    ...BASE,
    id: "mybus-r1-northbound",
    name: "MyBus Route 1 · Parkmall → Anjo World (via SRP)",
    fare: FARE_50,
    duration_mins: 85,
    frequency_mins: 10,
    first_trip: "05:00",
    last_trip: "22:00",
    schedule: sched([
      ["Weekdays", "05:00", "22:00", everyFew],
      ["Saturday", "05:00", "23:00", everyFew],
      ["Sunday", "05:20", "23:00", everyFew],
    ]),
    stops: seq([
      "mybus-harrison-park", "mybus-parkmall", "mybus-sm-city-cebu",
      "mybus-robinsons-galleria", "mybus-compania-maritima", "mybus-city-di-mare-srp",
      "mybus-shell-cscr", "mybus-laray", "mybus-rabaya", "mybus-cansojong",
      "mybus-carmen", "mybus-dawis", "mybus-san-isidro", "mybus-talisay-city-hall",
      "mybus-toyota-talisay", "mybus-mcdonalds-linao", "mybus-plaza-margarita",
      "mybus-chowking-calajoan", "mybus-anjo-world",
    ]),
  },
  // ── Route 2 ──
  {
    ...BASE,
    id: "mybus-r2-southbound",
    name: "MyBus Route 2 · Anjo World → SM Seaside (via SRP)",
    fare: FARE_30,
    duration_mins: 55,
    frequency_mins: 20,
    first_trip: "06:00",
    last_trip: "21:00",
    schedule: sched([
      ["Weekdays", "06:00", "21:00", every20],
      ["Weekends", "06:00", "21:00", every20],
    ]),
    stops: seq([
      "mybus-anjo-world", "mybus-aa-bbq-calajoan", "mybus-lipata-elementary",
      "mybus-mcdonalds-linao", "mybus-toyota-talisay", "mybus-talisay-city-hall",
      "mybus-san-isidro", "mybus-dawis", "mybus-carmen", "mybus-cansojong",
      "mybus-rabaya", "mybus-laray", "mybus-il-corso-srp", "mybus-nustar",
      "mybus-sm-seaside",
    ]),
  },
  {
    ...BASE,
    id: "mybus-r2-northbound",
    name: "MyBus Route 2 · SM Seaside → Anjo World (via SRP)",
    fare: FARE_30,
    duration_mins: 55,
    frequency_mins: 20,
    first_trip: "07:00",
    last_trip: "22:00",
    schedule: sched([
      ["Weekdays", "07:00", "22:00", every20],
      ["Weekends", "07:00", "23:00", every20],
    ]),
    stops: seq([
      "mybus-sm-seaside", "mybus-city-di-mare-srp", "mybus-laray", "mybus-rabaya",
      "mybus-cansojong", "mybus-carmen", "mybus-dawis", "mybus-san-isidro",
      "mybus-talisay-city-hall", "mybus-toyota-talisay", "mybus-mcdonalds-linao",
      "mybus-plaza-margarita", "mybus-chowking-calajoan", "mybus-anjo-world",
    ]),
  },
  // ── Route 3 ──
  {
    ...BASE,
    id: "mybus-r3-outbound",
    name: "MyBus Route 3 · SM J Mall → SM Seaside",
    fare: FARE_30,
    duration_mins: 50,
    frequency_mins: 30,
    first_trip: "08:40",
    last_trip: "21:00",
    schedule: sched([
      ["Weekdays", "08:40", "21:00", "every 30 min (hourly from SM J Mall)"],
      ["Weekends", "07:40", "21:00", "every 30 min (hourly from SM J Mall)"],
    ]),
    stops: seq([
      "mybus-sm-jmall", "mybus-nissan-ml-quezon", "mybus-happy-mart-briones",
      "mybus-hiway-seno-briones", "mybus-tipolo-skywalk", "mybus-711-subangdaku",
      "mybus-subangdaku-flyover", "mybus-old-north-bus-terminal", "mybus-sm-city-cebu",
      "mybus-robinsons-galleria", "mybus-compania-maritima", "mybus-sm-seaside",
    ]),
  },
  {
    ...BASE,
    id: "mybus-r3-inbound",
    name: "MyBus Route 3 · SM Seaside → SM J Mall (via Parkmall)",
    fare: FARE_30,
    duration_mins: 50,
    frequency_mins: 30,
    first_trip: "09:40",
    last_trip: "22:00",
    schedule: sched([
      ["Weekdays", "09:40", "22:00", "every 30 min (hourly to SM J Mall)"],
      ["Weekends", "08:40", "21:00", "every 30 min (hourly to SM J Mall)"],
    ]),
    stops: seq([
      "mybus-sm-seaside", "mybus-malacanang-sa-sugbo", "mybus-robinsons-galleria",
      "mybus-sm-city-cebu", "mybus-sm-hypermarket", "mybus-uc-med",
      "mybus-chong-hua-hospital", "mybus-parkmall", "mybus-caltex-briones",
      "mybus-sm-jmall",
    ]),
  },
  // ── Route 4 ──
  {
    ...BASE,
    id: "mybus-r4-outbound",
    name: "MyBus Route 4 · SM City Cebu → Mactan Airport",
    fare: FARE_50,
    duration_mins: 50,
    frequency_mins: 30,
    first_trip: "06:00",
    last_trip: "21:00",
    schedule: sched([
      ["Weekdays", "06:00", "21:00", every30],
      ["Weekends", "06:00", "21:00", every30],
    ]),
    stops: seq([
      "mybus-sm-city-cebu", "mybus-uc-med", "mybus-chong-hua-hospital",
      "mybus-parkmall", "mybus-bridges-town-square", "mybus-shell-plaridel",
      "mybus-island-central", "mybus-mactan-airport",
    ]),
  },
  {
    ...BASE,
    id: "mybus-r4-inbound",
    name: "MyBus Route 4 · Mactan Airport → SM City Cebu",
    fare: FARE_50,
    duration_mins: 50,
    frequency_mins: 30,
    first_trip: "07:00",
    last_trip: "22:00",
    schedule: sched([
      ["Weekdays", "07:00", "22:00", every30],
      ["Weekends", "07:00", "22:00", every30],
    ]),
    stops: seq([
      "mybus-mactan-airport", "mybus-island-central", "mybus-maayo-medical",
      "mybus-city-times-square", "mybus-chong-hua-hospital", "mybus-mo2-mantawi",
      "mybus-sm-city-cebu",
    ]),
  },
  // ── Route 5 (free ride) ──
  {
    ...BASE,
    id: "mybus-r5-outbound",
    name: "MyBus Route 5 · Fuente → SM Seaside (Free)",
    fare: FREE,
    duration_mins: 25,
    frequency_mins: 30,
    first_trip: "10:00",
    last_trip: "20:00",
    schedule: sched([
      ["Weekdays", "10:00", "20:00", every30],
      ["Weekends", "10:00", "20:00", every30],
    ]),
    stops: seq([
      "mybus-bdo-fuente", "mybus-v-rama", "mybus-dr-uy-bacalso",
      "mybus-cebu-home-builders", "mybus-sm-seaside",
    ]),
  },
  {
    ...BASE,
    id: "mybus-r5-inbound",
    name: "MyBus Route 5 · SM Seaside → Fuente (Free)",
    fare: FREE,
    duration_mins: 25,
    frequency_mins: 30,
    first_trip: "12:00",
    last_trip: "22:00",
    schedule: sched([
      ["Weekdays", "12:00", "22:00", every30],
      ["Weekends", "12:00", "23:00", every30],
    ]),
    stops: seq([
      "mybus-sm-seaside", "mybus-nature-spring-mambaling", "mybus-salazar-institute",
      "mybus-v-rama", "mybus-bdo-fuente",
    ]),
  },
];
