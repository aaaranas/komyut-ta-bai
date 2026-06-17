import type { Stop } from "@/lib/types";

/**
 * MyBus designated stops across Routes 1–5. Coordinates are from OSM
 * geocoding where available and hand-placed along the corridor otherwise;
 * treat them as approximate (good to ~100–300 m) pending field survey.
 * Route endpoints and major interchanges are marked as terminals so they
 * surface as hubs across the app.
 */
export const myBusStops: Stop[] = [
  // ── Minglanilla ──
  { id: "mybus-anjo-world", name: "Anjo World", lat: 10.249603, lng: 123.800226, municipality: "Minglanilla", type: "terminal" },
  { id: "mybus-aa-bbq-calajoan", name: "AA BBQ Calajo-an", lat: 10.23969, lng: 123.802568, municipality: "Minglanilla", type: "street_stop" },
  { id: "mybus-chowking-calajoan", name: "Chowking Calajo-an", lat: 10.2435, lng: 123.803, municipality: "Minglanilla", type: "street_stop" },
  { id: "mybus-don-macchiatos-lipata", name: "Don Macchiatos (Lipata)", lat: 10.254, lng: 123.812, municipality: "Minglanilla", type: "street_stop" },
  { id: "mybus-lipata-elementary", name: "Lipata Elementary School", lat: 10.255148, lng: 123.810164, municipality: "Minglanilla", type: "street_stop" },
  // ── Talisay City ──
  { id: "mybus-jlc-building-linao", name: "JLC Building (McDonald's Linao)", lat: 10.2582, lng: 123.8176, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-mcdonalds-linao", name: "McDonald's Linao", lat: 10.257945, lng: 123.817962, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-plaza-margarita", name: "Plaza Margarita", lat: 10.2465, lng: 123.8315, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-toyota-talisay", name: "Toyota Talisay", lat: 10.256258, lng: 123.824304, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-talisay-city-hall", name: "Talisay City Hall", lat: 10.253412, lng: 123.829326, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-san-isidro", name: "San Isidro", lat: 10.259887, lng: 123.840375, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-dawis", name: "Dawis", lat: 10.263544, lng: 123.851361, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-carmen", name: "Carmen", lat: 10.2565, lng: 123.853, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-cansojong", name: "Cansojong", lat: 10.249523, lng: 123.854883, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-rabaya", name: "Rabaya", lat: 10.250965, lng: 123.861308, municipality: "Talisay City", type: "street_stop" },
  { id: "mybus-laray", name: "Laray", lat: 10.243021, lng: 123.848825, municipality: "Talisay City", type: "street_stop" },
  // ── Cebu City — SRP & reclamation ──
  { id: "mybus-shell-cscr", name: "Shell CSCR", lat: 10.2625, lng: 123.8665, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-il-corso-srp", name: "Il Corso SRP", lat: 10.266, lng: 123.8782, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-city-di-mare-srp", name: "City di Mare SRP", lat: 10.266751, lng: 123.877444, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-nustar", name: "NuStar", lat: 10.271634, lng: 123.88057, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-sm-seaside", name: "SM Seaside", lat: 10.2787, lng: 123.8795, municipality: "Cebu City", type: "terminal" },
  { id: "mybus-malacanang-sa-sugbo", name: "Malacañang sa Sugbo", lat: 10.288, lng: 123.9015, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-compania-maritima", name: "Compania Maritima", lat: 10.291527, lng: 123.902232, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-robinsons-galleria", name: "Robinsons Galleria Cebu", lat: 10.303866, lng: 123.911366, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-sm-city-cebu", name: "SM City Cebu", lat: 10.312732, lng: 123.916481, municipality: "Cebu City", type: "terminal" },
  { id: "mybus-sm-hypermarket", name: "SM Hypermarket", lat: 10.3118, lng: 123.9172, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-old-north-bus-terminal", name: "Old North Bus Terminal", lat: 10.3105, lng: 123.9185, municipality: "Cebu City", type: "street_stop" },
  // ── Mandaue City ──
  { id: "mybus-uc-med", name: "UC Med", lat: 10.3225, lng: 123.9275, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-chong-hua-hospital", name: "Chong Hua Hospital (Mandaue)", lat: 10.322, lng: 123.9295, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-mo2-mantawi", name: "MO2 Restobar (Mantawi)", lat: 10.323, lng: 123.929, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-harrison-park", name: "Harrison Park", lat: 10.3255, lng: 123.9298, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-parkmall", name: "Parkmall", lat: 10.3268, lng: 123.9302, municipality: "Mandaue City", type: "terminal" },
  { id: "mybus-sm-jmall", name: "SM J Mall", lat: 10.3298, lng: 123.945, municipality: "Mandaue City", type: "terminal" },
  { id: "mybus-nissan-ml-quezon", name: "Nissan (ML Quezon Ave.)", lat: 10.3345, lng: 123.9385, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-happy-mart-briones", name: "Happy Mart (MC Briones St.)", lat: 10.331, lng: 123.94, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-hiway-seno-briones", name: "Hi-way Seno (MC Briones St.)", lat: 10.329, lng: 123.941, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-tipolo-skywalk", name: "Tipolo Skywalk", lat: 10.33, lng: 123.943, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-711-subangdaku", name: "7-Eleven Subangdaku", lat: 10.322, lng: 123.926, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-subangdaku-flyover", name: "Subangdaku Flyover (M. Logarta Ave.)", lat: 10.32, lng: 123.924, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-caltex-briones", name: "Caltex (San Miguel Brewery, MC Briones)", lat: 10.331, lng: 123.9405, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-bridges-town-square", name: "Bridges Town Square (Plaridel St.)", lat: 10.327, lng: 123.9445, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-shell-plaridel", name: "Shell (Plaridel St.)", lat: 10.32, lng: 123.951, municipality: "Mandaue City", type: "street_stop" },
  { id: "mybus-maayo-medical", name: "Maayo Medical Center (Plaridel St.)", lat: 10.319, lng: 123.953, municipality: "Mandaue City", type: "street_stop" },
  // ── Lapu-Lapu City (Mactan) ──
  { id: "mybus-city-times-square", name: "City Times Square / Big Hotel", lat: 10.318, lng: 123.955, municipality: "Lapu-Lapu City", type: "street_stop" },
  { id: "mybus-island-central", name: "Island Central Mactan", lat: 10.3155, lng: 123.9665, municipality: "Lapu-Lapu City", type: "street_stop" },
  { id: "mybus-mactan-airport", name: "Mactan-Cebu Int'l Airport", lat: 10.3074, lng: 123.9793, municipality: "Lapu-Lapu City", type: "terminal" },
  // ── Cebu City — Route 5 (Fuente / Mambaling) ──
  { id: "mybus-bdo-fuente", name: "BDO Fuente", lat: 10.3093, lng: 123.8935, municipality: "Cebu City", type: "terminal" },
  { id: "mybus-v-rama", name: "V. Rama Ave.", lat: 10.301, lng: 123.889, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-dr-uy-bacalso", name: "Dr. Uy (N. Bacalso Hwy)", lat: 10.295, lng: 123.882, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-cebu-home-builders", name: "Cebu Home Builders (N. Bacalso)", lat: 10.29, lng: 123.881, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-nature-spring-mambaling", name: "Nature Spring Mambaling", lat: 10.285, lng: 123.881, municipality: "Cebu City", type: "street_stop" },
  { id: "mybus-salazar-institute", name: "Salazar Institute of Technology", lat: 10.293, lng: 123.884, municipality: "Cebu City", type: "street_stop" },
];
