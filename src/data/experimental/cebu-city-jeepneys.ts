import type { ExperimentalRoute } from '@/lib/types';

/**
 * EXPERIMENTAL / UNVERIFIED — Cebu City & Mandaue (MI-) jeepney routes
 * scraped from https://cebujeepneys.weebly.com/jeepney-routes.html on
 * 2026-06-13. The source is a community map last known to be maintained
 * around the early 2010s, so codes and paths may be outdated. These routes
 * have no stop coordinates yet, are NOT fed into the journey planner, and
 * are listed in the route browser only as a research starting point.
 * Verify each route in the field, then promote it to src/data/routes.ts
 * with proper stops, fares, and a verified_date.
 */
export const experimentalJeepneyRoutes: ExperimentalRoute[] = [
  {
    "code": "01B",
    "mode": "jeepney",
    "summary": "Sambag 1 (PRIVATE) ⇄ Pier 3&2 via Colon St",
    "paths": [
      "Sambag 1 (PRIVATE) - Pier 3&2 via Colon St.",
      "Sambag 1 to Pier 3 & 2 via Colon St.",
      "sambag 1 - University of San Carlos (South Campus) - Private - J. Alcantara St. - Asian College of Technology - E Mall - Leaon Kilat St. - Gaisano Capital South - Colon St. - Metro Colon - Colonnade Mall - University of the Visayas - Gaisano Main - Colon Obelisk - Mabini St. - Sandiego-Yap Ancestral House - Brgy. Parian - A. Bonifacio St. - D. Jakosalem St. - P. del Rosario St. - T. Padilla St. - Pier 4 - Sergio Osmena Blvd. - V. Sotto St. - Pier 3 - Cebu Mactan Ferry Terminal - C. Arellano Blvd. - Pier 2.",
      "Pier 2 - C. Arellano St. - Pier 3 - Cebu-Mactan Ferry Terminal - V. Sotto St. - Sergio Osmena Blvd. - Pier 4 - T. Padilla St. - Sikatuna St. - Brgy. Parian - J.C. Zamora St. - Sanciangko St. - University of the Visayas - Sogo Hotel - GV Tower Hotel - University of Cebu (Main Campus) - Leon Kilat St. - E Mall - Asian College of Technology - J. Alcantara St. - Private - University of San Carlos (South Campus) - Sambag 1."
    ],
    "source_url": "https://cebujeepneys.weebly.com/01b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "01C",
    "mode": "jeepney",
    "summary": "V. Rama Ave ⇄ Pier 3",
    "paths": [
      "V. Rama Ave. - Sambag 1 (USC- girls high) - J. Alcantara St. - E-mall - L. Kilat St. - Colon St. - Metro Colon - Colonnade Supermarket - Gaisano Main - UV - colon obelisk - mabini St. - Zulueta St. - M.J. Cuenco St. - T. Padilla St. - B. Benedicto St. - G. Maxilom Ave. Ext. - Pier 4 - S. Osmena Blvd. - Pier 3.",
      "Pier 3 - V. Sotto St. - MJ. Cuenco Ave. - CTU - V. Gullas St. - D. Jakosalem St. - Gaisano Main - University of the Visayas - Sancianko St. - University of cebu - L. Kilat St. - E-mall - J. Alcantara St. - USC-girls high - V. rama Ave."
    ],
    "source_url": "https://cebujeepneys.weebly.com/01c.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "01K",
    "mode": "jeepney",
    "summary": "Urgello St ⇄ North Bus Terminal",
    "paths": [
      "Urgello St. - Sacred Heart Hospital - South Western University - E. Mall - L. Kilat St. - Colon St. Metro Gaisano (colon) - Collonade Supermarket - University of the Visayas - Gaisano Main - Brgy. Parian - Zulueta St. - MJ. Cuenco Ave. - NSO - General Maxilom Ave. - A. Soriano Ave. - SM - SM Hypermarket - North Bus Terminal.",
      "North Bus Terminal - Cebu Doctors University - CICC - Parkmall PUJ Terminal.",
      "Parkmall - MO2 - North Bus Terminal - Sm Hypermarket - Sm City Cebu - White Gold Club - Queen City Memorial Garden - White Gold House - T. Padilla St. - NSO - CITU - V. Gullas St. - Manalili St. - Legaspit St. - Collonade Supermarket - Pelaez St. - Sancianko St. - Sogo HOtel - GV Tower Hotel - E.Mall - Urgello St. - South Western University - Sacred Heart Hospital."
    ],
    "source_url": "https://cebujeepneys.weebly.com/01k.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "02B",
    "mode": "jeepney",
    "summary": "CCMC ⇄ Pier 3",
    "paths": [
      "CCMC - N. Bacalso Ave. - Cebu South Bus Terminal - E Mall - L. Kilat St. - Colon St. - Metro Gaisano Colon - Colonnade Supermarket - Gaisano Main - University of the Visayas - P. Burgos St. - Cebu Metropolitan Cathedral - F. Urdanet St. - Legaspi Ext. - Plaza Independencia - C. Arellano Blvd. - Pier 1 - Pier 2 - Pier 3",
      "Pier 3 - V. Sotto St. - Sergio Osmena Blvd. - Pier 4 - Pier 5 - Robinson Mall - Gen. Maxilom Ave. Ext. - White Gold House - Cebu City Health Center - Bueareau of Quarantin - Cebu City Civil Registrars - Cebu Skin Clinic - Imus Ave. - MJ. Cuenco Ave. - Museo Sugbo - CPILS - A. Bonifacio St. - Sikatuna St. - JC. Zamora St. - Sancianko St. - University of the Visayas - Sogo Hotel - GV Tower Hotel - University of Cebu - Elizabeth Mall - Panganiban St. - Cebu City Medical Center."
    ],
    "source_url": "https://cebujeepneys.weebly.com/02b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "03A",
    "mode": "jeepney",
    "summary": "Cityscape Hotel ⇄ Carbon Public Market",
    "paths": [
      "Cityscape Hotel - Brgy, Kasambagan - F. Cabahug St. - Panagdait - Sykes Asia - Synergis Center - Rainforest Park - Citi Park Hotel - Fooda (Kasambagan) - Sarrosa International Hotel - Castle Peak Hotel - Pope John Paul II Ave. - PLDT Smart Communications - Camelite Monastery - Mabolo Church - MJ. Cuenco Ave. - The Persimmon - Hipodromo - Carreta Cemetery - Imus Ave. - MJ. Cuenco ave. - Museo Sugbo - CPILS - NSO - Cebu Technological University - V. Gullas St. - Gaisano Main - Manalili St. - Colonnade Supermarket - Progreso St. - Carbon Public Market.",
      "Carbon Public Market - MC. Briones St. - Senior Citizens Plaza - Cebu City Hall - Basilica del Sto. Nino - La Nueva Supermarket - Prince warehouse (city Hall) - Lapulapu St. - MCWD - DFA - COMELEC - DTI - Urdaneta St. - MJ. Cuenco ave. - CTU - Commission on Audit - NSO - Martires - CPILS - Museo Sugbo - Carreta Cemetery - Hipodromo - The Persimmon - Mabolo Church - Pope John Paull ll Ave. - Carmelite Monastery - PLDT - F. Cabahug St. - Brgy. Kasambagan - Castle Peak Hotel - Sarrosa International Hotel - Fooda Kasambagan - Citi Park Hotel - Rainforest Park - Synergis Center - Sykes Asia (Cebu) - Panagdait - Cityscape Hotel."
    ],
    "source_url": "https://cebujeepneys.weebly.com/03a.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "03B",
    "mode": "jeepney",
    "summary": "Mabolo to Colon via Jones Ave",
    "paths": [
      "Mabolo to Colon via Jones Ave",
      "Mabolo to Colon via Jones ave.",
      "Sindulan - carwash - mabolo - mabolo church - M.J. Cuenco ave. - hipodromo - Carreta cemetery - G. Maxilom Ave. - mango ave - USC (north campus) - Fooda saversmart - horizons 101 - mango square - national bookstore - robinsons place - Fuente osmena circle  - crown regency hotel - jones ave. - osmena boulevard - abellana sports complex - CNU - SSS - GV tower hotel - colon st. - Metro Colon.",
      "metro colon - p. lopez st. - USJR - Carbon Public Market - Lincoln St. - F. Gonzales St. - M.C. Briones St. - cebu city hall - la nueva (sto. nino) - prince warehouse club - MCWD - lapu-lapu St. - dept. of Foreign Affairs - OWWA - F. Urdaneta St. - M.J. Cuenco Ave. - CTU - NSO - CPILS - Museo Sugbo - Carreta - Hipodromo - Mabolo - Carwash - Sindulan."
    ],
    "source_url": "https://cebujeepneys.weebly.com/03b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "03L",
    "mode": "jeepney",
    "summary": "Cabantan St ⇄ Carbon Public Market",
    "paths": [
      "Cabantan St. - C. Rosales ave. - Juan Luna ave. - M.J. Cuenco Ave. - Mabolo Church - Carreta Cemetery - Imus Ave. - M.J. Cuenco ave. - NSO - CTU - V. Gullas St. - Manalili st. - Progreso St. - Carbon Public Market.",
      "Carbon Public Market - MC. Briones St. - Cebu City Hall - Basilica del Sto. Nino - Prince Warehouse Club (MC) - La Nueva Supermart(City Hall) - Lapulapu St. - MCWD - A. Jereza St. - MJ. Cuenco Ave. - CTU - NSO - CPILS - Museo Sugbo - Imus Ave. - Mj. Cuenco Ave. - P. Cabantan St. - Mabolo (Luyo)."
    ],
    "source_url": "https://cebujeepneys.weebly.com/03l.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "03Q",
    "mode": "jeepney",
    "summary": "AYALA CENTER CEBU ⇄ SM CITY CEBU",
    "paths": [
      "FROM AYALA CENTER CEBU TO SM CITY CEBU"
    ],
    "source_url": "https://cebujeepneys.weebly.com/03q.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "04B",
    "mode": "jeepney",
    "summary": "Camp Lapulapu ⇄ Progreso St",
    "paths": [
      "Camp Lapulapu - Salinas Drive - JY Square Mall - Lahug - University of the Philippines - Harolds Hotel - Escario St. - Cebu Provincial Capitol - Osmena Blvd. - Cebu Doctors University - Fuente Osmena Circle - Robinsons Fuente - Crown Regency Hotel - Jones Ave. - SSS - Metro Colon - P. Lopez St. - Magallanes St. - University of San Jose-Recoletos - Carbon Public Market - F. Calderon St. - Progreso St.",
      "Carbon to Lahug via Osmena Blvd.",
      "Carbon - MC. Briones St. - Cebu City Hall - Basilica del sto.nino - La Nueva Supermarket (city hall) - Lapulapu St. - MCWD - Legaspit St. - Colonnade Supermarket - Pelaez St. - Hotel de Mercedez - University of San Carlos Main - Sto. Rosario Church - Central Bank of the Philippines - Osmena Blvd. - Cebu Normal University - Abellana Sports Complex - Crown Regency Hotel - Robinsons Place Cebu fuente - Fuente Osmena Circle - Osmena Blvd. - Cebu Doctors University - Cebu Provincial Capitol - Escario St. - Golden peak hotel - Philhealth - Gorordo Ave. - Tonros Apartelle - Harolds Hotel -  Handuraw Pizza Lahug - University of the Philippines - Jy Square Mall - Salinas Drive - Camp Lapu lapu."
    ],
    "source_url": "https://cebujeepneys.weebly.com/04b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "04C",
    "mode": "jeepney",
    "summary": "No text description on source page (map only)",
    "paths": [],
    "source_url": "https://cebujeepneys.weebly.com/04c.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "04D",
    "mode": "jeepney",
    "summary": "Plaza Housing (Busay) ⇄ Cebu City hall ",
    "paths": [
      "Plaza Housing (Busay) - Cebu Transcentral Highway - Cebu Veterans Drive - Marco Polo Hotel - Jy Square Mall - Gorordo Ave. - Lahug - UP Lahug - Harolds Hotel - Morales St. - Escario St. - Cebu Provincial Capitol - S. Osmena Blvd. - Cebu Doctors University - Fuente Osmena Circle - Robinsons Fuente Cebu - JOnes Ave. - - Abellana Sports Complex - Cebu NOrmal University - SSS - Sancianko ST. - UC Main - E. Mall - Taboan PUblic Market - Lakandula St. - Tupas St. - Magallanes St. - Carbon Public Market - Basilica del Sto. Nino - Cebu City hall .",
      "Carbon - Cebu City Hall - Mc. Briones St. - MJ. Cuenco Ave. - Osmena Blvd. - Lapulapu St. - Legaspi St. - Cathedral - Colonnade Supermarket - Pelaez St. - Cebu Century Hotel - Hotel de Mercedez - Sto Rosario Church - University of San Carlos Main - Osmena Blvd. - Central Bank of the Philippines - Cebu Normal University - Abellane Sports Center - Crown Regency HOtel and Suites - Robinsons Fuente Cebu - Fuente Osmena Circle - osmena Blvd - Cebu Provincial Capitol - Escario St. - Gorordo Ave. - UP Lahug - JY Square Mall - Cebu Veterans Drive - Marco Polo HOtel - dcebu Transcentral HIghway - Busay - Plaza Housing."
    ],
    "source_url": "https://cebujeepneys.weebly.com/04d.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "04H",
    "mode": "jeepney",
    "summary": "Plaza Housing to Carbon via Jones Ave.",
    "paths": [
      "Plaza Housing to Carbon via Jones Ave.",
      "Plaza Housing (Busay) - Cebu Transcentral Highway - Cebu Veterans Drive - Marco Polo Plaza Hotel - Lahug - Jy Square Mall - Gorordo Ave. - Dep-ed - Beverly Hills - Mormons Church (church of Jesus Christ of Latter day Saints - Lahug Elem. School - Sugbo Cultural Center - University of the Philippines (Cebu) - Harolds Hotel - Molave St. - Morales St. - N. Escario St. - Our Lady of Sacred Heart Parish - Capitol Tourist Inn - Cebu Pension Plaza -  - The Maxwell Hotel - Escario Central - Cebu Provincial Capitol - Osmena Blvd (Jones Ave.) - Cebu Doctors Hospital - Fuente Osmena Circle - Robinsons Fuente - Crown Regency Hotel - Visayas Community Medical Center - Harrison Park - Cebu City Sports Center(Abellana) - Cebu Normal University - GV Tower Hotel - Sanciangko St. - Elizabeth Mall - New Cebu Coliseum - Panganiban St. - Magallanes St. - University of San Jose Recoletos - Carbon Public Market - Escano St. - El Filibusterismo St. - Progreso St.",
      "Carbon Public Market - MC. Briones St. - Cebu City Hall - La Nueva Supermarket(City Hall) - Basilica del Sto. Nino - Lapulapu St. - MCWD - DFA - Legaspi St. - Cebu Metropolitan Cathedral - Cebu Eastern College - Colonnade Supermarket - Pelaez St. - Hotel de Mercedes - P. del Rosario St. - University of San Carlos(Main) - Osmena Blvd.(Jones Ave.) - Cebu City Sports Center(Abellana) - Cebu Normal University - Visayas Community Medical Center - Crown Regency Hotel - Robinsons Place Cebu(fuente) - Fuente Osmena Circle -",
      "Cebu Doctors Hospital - Cebu Provincial Capitol - N. Escario St. - Capitol Tourist Inn - Our Lady of Sacred Heart Parish - Golden Peak Hotel - PHILHEALTH - Gorordo Ave. - Harolds Hotel - University of the Philippines(Cebu) - Sugbo Cultural Center - Lahug Elem. School - Church of Jesus Christ of Latter Day Saints - Dep-ed - Beverly Hills - Lahug - Jy Square Mall - Cebu Veterans Drive - Marco Polo Plaza Hotel - Cebu Transcentral Highway - Busay - Plaza Housing"
    ],
    "source_url": "https://cebujeepneys.weebly.com/04h.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "04I",
    "mode": "jeepney",
    "summary": "Busay -Plaza Housing ⇄ Progresso St. -",
    "paths": [
      "Busay -Plaza Housing - Trancentral Highway - Cebu Veterans Drive - Marco Polo Hotel - Jy Square Mall - Gorordo Ave. - Lahug - UP(lahug) - Harolds Hotel - Golden Peak Hotel - Philhealth - Royal Concourse - Perpetual Soccor - Asilo dela Milagrosa - Mango Ave. - Gen. Maxilom Ave. - Fooda Mango - Horizon 101 - Robinsons Place (fuente) - F. Ramos St. - Junquera ext. - Junquera St. - Sancianko St. - elizabeth Mall - Panganbiban ST. - Magallanes St. - Usjr - Manalili St. - Carbon Public Market - Progresso St. -",
      "Carbon - M.C. Briones St. - Cebu City Hall - La Nueva Supermart (city hall) - Prince Warehouse Club (city hall) - Basilica del Sto. Nino - Lapu-lapu St.- Legaspi St. - Cebu Metropolitan Cathedral - D. Jakosalem St. - Gaisano Main - University of the Visayas - Cogon Ramos - Echavez Ext. - F. Ramos St. - Robinsons Place - Mango ave. - Gen. Maxilom Ave. - One Mango Ave. - The Beat - Horizons 101 - Fooaa Mango - Gorordo Ave. - Royal Concourse - Golden Peak Hotel - Philhealth - Harolds Hotel - UP(cebu) - Lahug - JY square Mall - Cebu Veterans Drive - Marco Polo - Cebu Transcentral Highway - Plaza Housing - Busay."
    ],
    "source_url": "https://cebujeepneys.weebly.com/04i.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "04L",
    "mode": "jeepney",
    "summary": "Lahug to Sm via Ayala",
    "paths": [
      "Lahug to Sm via Ayala",
      "Lahug to Sm via Ayala",
      "Lahug- JY Square Mall - Gorordo Ave. - corner Sudlon - Corner Beverly Hills - Corner Dep-ed (ecotech) - Mormons Church (Church of Jesus Christ of Latter-day Saints) - Lahug Brgy Hall - University of the Philippines (Cebu) - Sugbo Cultural Center - Harolds Hotel - Tonross Apartelle - The Golden Peak Hotel  - N. Escario Hotel -  Philhealth - Kuya J's Restaurant - Cebu Parklane Hotel - Grand Cenia Hotel - Hongkong Plaza Hotel - Cebu Business Park - Mindanao Ave. - Pag-ibig Fund - Ayala Center Cebu - Cardinal Rosales Ave. - Pope John Paul ll Ave. - PLDT - Carmelite Monastery - St. Joseph Parish (Mabolo Church) - Sm City Cebu.",
      "Sm City Cebu - Radisson Hotel - Sergio Osmena Blvd. - Kaohsiung St. - Cebu Daily News - A. Soriano Ave. - Juan Luna Ave. ext. - Pope John Paul ll Ave. - Mabolo Church - Andoks Mabolo - Carmelite Monastery - San Carlos Seminary College - TESDA Vll - Salinas Drive - Cebu IT Park - Waterfront Hotel - Crowne Garden Hotel - Jy Square Mall - Lahug."
    ],
    "source_url": "https://cebujeepneys.weebly.com/04l.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "04M",
    "mode": "jeepney",
    "summary": "Ayala Terminal ⇄ Jy Square Mall",
    "paths": [
      "Ayala Terminal - Gorordo Ave. - Royal Concourse - Philhealth - Golden peak Hotel - UP (lahug) - Lahug Brgy. Hall - The Church of Christ of Latter Day Saints Temple - Corner Sudlon - Jy Square Mall.",
      "Jy Square Mall - Salinas Drive - USP - IT Park - Waterfront Hotel - Arch. Reyes Ave. - Ayala Terminal."
    ],
    "source_url": "https://cebujeepneys.weebly.com/04m.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "06B",
    "mode": "jeepney",
    "summary": "Guadalupe Church ⇄ Osmena Blvd",
    "paths": [
      "Guadalupe Church - Fooda (guadalupe0 - PRC - M. Velez St. - Provincial Capitol - Jones Ave. - Fuente Osmena Circle - Robinsons Place - Crown Regency Hotel - Osmena Blvd. - Abellana Sports Complex - Metro Gaisano - USJR - Carbon Public Market - Cebu City Hall - Basilica Menore del Snr. Snto. Nino - Osmena Blvd.",
      "Osmena Blvd. - Basilica del sto. Nino - Metro Gaisano (colon) - Abellana Sports Complex - Cebu Normal University - Crown Regency Hotel - Robinsons Place Cebu - Fuente Osmena Circle - Cebu Doctors University - Provincial Capitol - M. Velez St. - PRC - Fooda (guadalupe) - Guadalupe Church."
    ],
    "source_url": "https://cebujeepneys.weebly.com/06b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "06C",
    "mode": "jeepney",
    "summary": "Guadalupe church ⇄ MCWD -Osmena Blvd",
    "paths": [
      "Guadalupe church - Fooda Guadalupe - PRC - V. Rama Ave. - B. Rodriguez St. - Vicente Sotto Hospital - Fuente Osmena Circle - Robinsons Place - Crown Regency Hotel - Osmena Blvd. - Abellana Sports Center - Cebu Normal University - SSS - Metro Gaisano - Plaridel St. - MC. Briones St. - Cebu City Hall - Basilica Menore del Santo Nino - La Nueva - MCWD -Osmena Blvd.",
      "Osmena Blvd. - Basilica Menore del Santo Nino - Metro Gaisano - Colon - Jones Ave. - Abellana Sports Center - Cebu Normal University - Crown Regency Hotel - Fuente Osmena Circle - Robinsons Place - B. Rodriguez St. - Vicente Sotto Hospital - V. Rama Ave. - PRC - Fooda (guadalupe) - Guadalupe Church."
    ],
    "source_url": "https://cebujeepneys.weebly.com/06c.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "06F",
    "mode": "jeepney",
    "summary": "Guadalupe Church ⇄ Progreso St",
    "paths": [
      "Guadalupe Church - V. Rama Ave. - Fooda Saversmart - Guadalupe Brgy. Hall - PRC - R. Duterte St. - M. Velez St. - Don Gil Garcia St. - Cebu Provincial Capitol - Don Jose Avila St. - Osmena Blvd.(Jones Ave) - Cebu Doctors Hospital - Fuente Osmena Circle - Robinsons Place Fuente - Crown Regency Hotel & Suites - Cebu City Sports Center - Abellana Sports Complex - Cebu Normal University - SSS - GV Tower Hotel - Metro Gaisano (Colon) - Happy Mart - Plaridel St. - Carbon Public Market - Progreso St.",
      "Carbon Public Market - MC. Briones St. - Cebu City Hall - Senior Citizens Park - Basilica del Sto. Nino - La nueva supermart - Lapulapu St. - MCWD - Osmena Blvd. - Basilica Menore del Sto. Nino - Metro Gaisano Colon - La Guardia Hotel - Central Bank of the Philippines - Cebu City Sports Center - Cebu Normal University - Camp Sergio Osmena - PLDT - Crown Regency Hotel - Robinsons Place Fuente - Fuente Osmena Circle - Cebu Doctors Hospital - Cebu Provincial Capitol - Escario St. - Don Gil Garcia St. - M. Velez St. - R. Duterte St. - V. Rama St. - PRC - Guadalupe Brgy. Hall - Fooda Saversmart - Guadalupe Church."
    ],
    "source_url": "https://cebujeepneys.weebly.com/06f.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "06G",
    "mode": "jeepney",
    "summary": "Guadalupe Church ⇄ C. Padilla St",
    "paths": [
      "Guadalupe Church - V. rama Ave. - Fooda Saversmart - PRC - Securities and Exchange Commission - Calamba Cemetery - University of San Carlos (girls high school) - Katipunan st. - tres de abril st. - Carlock st. - San Nicolas Elementary school - B. aranas St. - Taboan Public Market - Pasil Fish Market - San Nicolas Church - Carlos Gothong HS - C. Padilla St.",
      "C. Padilla St. - R. Padilla st. - N. Bacalso Hi-way - Salazar Colleges - V. rama Ave. - USC (girls HS) - Queensland Hotel - Calamba Cemetery - Securities and Exchange Commission - PRC - Fooda saversmart - Guadalupe Church."
    ],
    "source_url": "https://cebujeepneys.weebly.com/06g.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "06H",
    "mode": "jeepney",
    "summary": "Guadalupe Church ⇄ Sm City cebu puj terminal",
    "paths": [
      "Guadalupe Church - V. rama ave. - crown regency residences - Fooda Saversmart (guadalupe branch) -corner banawa - cebu provincial capitol - bo's coffee (jones ave.) - cebu doctors university (jones ave.) - n. escario st. - philhealth - ayala center cebu - cabantan st. - juan luna avenue (mabolo) - mabolo church - Sm City cebu puj terminal",
      "sm terminal - mabolo church - ayala center terminal - asilo - fooda mango - mango avenue - robinsons fuente - fuente circle - vicente sotto hospital - b. rodriguez st. - v. rama avenue. corner banawa - PRC (professional regulations commission) - fooda (guadalupe branch) - guadalupe church."
    ],
    "source_url": "https://cebujeepneys.weebly.com/06h.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "07B",
    "mode": "jeepney",
    "summary": "Banawa ⇄ Progreso St",
    "paths": [
      "Banawa - R. Duterte St. - V. rama ave. - B. Rodriguez St. - Vicente Sotto Hospital - Fuente Osmena Circle - Robinsons Fuente - Crown Regency Hotel - Osmena Blvd. - Metro Colon - P. Lopez St. - USJR - Magallanes St. - Manalili St. - Carbon Public Market - Progreso St.",
      "Carbon - M.C. Briones St. - Mj. Cuenco Ave. - Osmena Blvd - Metro Colon - Abellana Sports Complex - Jones Ave. - Cebu Normal University - Crown Regency Hotel - Robinsons Fuente - Fuente Osmena Circle - Provincial Capitol - M. Velez St. - R. Duterte St. - Rustans (banawa) - Banawa."
    ],
    "source_url": "https://cebujeepneys.weebly.com/07b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "08G",
    "mode": "jeepney",
    "summary": "ALUMNOS TO COLON VIA C. PADILLA ST.",
    "paths": [
      "ALUMNOS TO COLON VIA C. PADILLA ST.",
      "Alumnos - Tagunol St. - UC-METC - C. Padilla St. - Jai-alai - Carlock St. - Spoliarium St. - Pasil - San NIcolas Parish - Colon - Metro Gaisano - Colonnade Mall - Gaisano Main - University of the Visayas - Zulueta St.",
      "Zulueta St. - MJ. Cuenco Ave. - CTU - Legaspi St. - Cebu Metropolitan Cathedral - V. Gullas St. - Manalili St. - Magallanes St. - USJR - Carbon Public Market - C. Padilla St. - Cacoy Doce Pares - Jai-alai - San Roque - UC-METC - Mambaling - Alumnos."
    ],
    "source_url": "https://cebujeepneys.weebly.com/08g.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "09C",
    "mode": "jeepney",
    "summary": "No text description on source page (map only)",
    "paths": [],
    "source_url": "https://cebujeepneys.weebly.com/09c.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "09F",
    "mode": "jeepney",
    "summary": "Quiot ⇄ Cebu Metropolitan Cathedral",
    "paths": [
      "Quiot - Ibabao - Sabellano St. - Southwestern University - Don Vicente Rama Memorial National High School - Basak - Mambaling - Shopwise - Mambaling Flyover - CIT - SCSIT - Natalio Bacalso Ave. - E.mall - ACT - P. del Rosario - University of San Carlos - Junquera St. - Colon St. - Gaisano Main - University of the Visayas - Zulueta St. -M.J. Cuenco Ave. - Legaspi St. - Cebu Metropolitan Cathedral.",
      "Cebu Metropolitan Cathedral - Basilica Menore del Santo Nino - Legaspit St. - Manalili St. - Magallanes St. - University of San Jose Recoletos - Carbon Public Market - C. Padilla St. - Duljo Fatima (R. Padilla St.) - CIT - N. Bacalso Ave. - Mambaling Flyover - Mambaling - Shopwise - Basak - Basak Night High School - USJR (Hight School) - Bayanihan Village - Sabellano St. - Brgy. Quiot"
    ],
    "source_url": "https://cebujeepneys.weebly.com/09f.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "09G",
    "mode": "jeepney",
    "summary": "Basak (Ibabao) to Colon via Magallanes",
    "paths": [
      "Basak (Ibabao) to Colon via Magallanes",
      "Colon to Basak(Ibabao) via C. padilla st.",
      "Basak (Ibabao) - Hi way - Shopwise - Fooda (mambaling) - Mambaling flyover - C. Padilla St. - Carlock St. - Spoliarium St. - Pasil - San Nicolas Parish Church - Colon St. - L. Kilat St. - USJR - Carbon Public Market - Magallanes St. - Basilica Menore Del Sto. Nino - Cebu City Hall - MCWD - Lucky 7 supermarket - Legaspi St.",
      "Legaspi St. - Collonade Mall (Oriente) - Colon St. - Metro Gaisano - C. Padilla St. - Jai-alai - Mambling Flyover - Hi-way - Mambaling - Fooda (Mambaling) - Shopwise - Basak - Bayanihan Village - Sabellano St. - Brgy. Quiot."
    ],
    "source_url": "https://cebujeepneys.weebly.com/09g.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "09H",
    "mode": "jeepney",
    "summary": "No text description on source page (map only)",
    "paths": [],
    "source_url": "https://cebujeepneys.weebly.com/09h.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "10F",
    "mode": "jeepney",
    "summary": "Bulacao ⇄ Cor. V. Rama Ave",
    "paths": [
      "Bulacao - Pardo - Basak - Mambaling - CIT - SCSIT - Cor. V. Rama Ave.",
      "Cor. V. Rama Ave. - Citilink Terminal - CCMC - Cebu South Bus Terminal - E.mall - P.del Rosario St. - University of San Carlos - Junquera St.",
      "Junquera St. - Colon St. - Metro Gaisano - Borromeo St. - Sancianco St. - Panganiban St. -  CCMC - N. Bacalso Ave. (hi-way) - CIT - Mambaling - Fooda (Basak) - Shopwise - Basak - Pardo - Bulacao"
    ],
    "source_url": "https://cebujeepneys.weebly.com/10f.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "10G",
    "mode": "jeepney",
    "summary": "Pardo ⇄ Legaspi St",
    "paths": [
      "Pardo - Basak - Shopwise - Fooda (mambaling) - Mambaling - C. Padilla St. - Jai-alai - Pasil - San Nicolas Church - Colon St. - L. Kilat St. - USJR - Carbon Public Market - Magallanes St. - Basilica Menore del Santo Nino - Cebu City Hall - Prince MC - La Nueva - MCWD - Legaspi St.",
      "Legaspi St. - D. Jakosalem St. - Colon St. - Gaisano Main - University of the Visayas - Colonnade Supermarket - Metro Gaisano - C. Padilla St. - Cebu South Road - Mambaling - Fooda (Mambaling) - Shopwise - Basak - Pardo"
    ],
    "source_url": "https://cebujeepneys.weebly.com/10g.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "10H",
    "mode": "jeepney",
    "summary": "From bulacao (Saint Paul College foundation) ⇄ Sm",
    "paths": [
      "From bulacao (Saint Paul College foundation) - Pardo - Basak - mambaling - CIT -SCSIT - Citilink - CCMC - Cebu South Bus terminal - E. mall - ACT - P.del Rosario - Sikatun st. -  T. padilla st. - white gold house - white gold club - Sm.",
      "sm - white gold - cebu city registrars office - DSWD - Imus ave. - M. J. Cuenco Ave. - cor. t. Padilla St. - NSO - Legaspi St. - Cebu Metropolitan Cathedral - Manalili st. - Borromeo St. - Sancianko st. - Aerol Pensione House - CCMC - N. Bacalso Avenue - Citilink - SCSIT - Napolcom - CIT - Mambaling - Shopwise - Basak - Pardo - Bulacao."
    ],
    "source_url": "https://cebujeepneys.weebly.com/10h.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "10M",
    "mode": "jeepney",
    "summary": "Bulcao ⇄ Sm City Cebu (terminal)",
    "paths": [
      "Bulcao - St. Paul College (bulacao) - Cit Hardware - Prince Warehouse Club -  Pardo - Basak - USJR (High School) - Mamabaling - Shopwise - Fooda - Mambaling Flyover - CIT - Salazar College - Napolcom - CCMC - Cebu South Bus Terminal - E mall - L. Kilat St. - Colon St. - Metro Colon - Colonnade Supermarket - 138 Mall - Gaisano Main - University of the visayas - Colon Obelisk - Zulueta St. - MJ. Cuenco Ave. - NSO - T. Padilla St. - B. Benedicto St. - White Gold House - A. Soriano Ave. - White Gold Club - Queen City Memorial Garden - Sm City Cebu (terminal).",
      "Sm Terminal - A. Soriano Ave. - White Gold Club - Queen City Memorial Garden - Queensland - White Gold House - B. Benedecto St. - T. Padilla St. - Mj. Cuenco ave. - NSO - CTU - Plaza Independecia - Legaspi st. - V. gullas St. - Manalili St. - A. Borromeo St. - Sanciangko St. - Panganiban st. - CCMC - N. Bacalso St. - Cebu South Road - CIT - Mambaling - Fooda - Shopwise - Basak - Pardo - Citi Hardware -  Prince warehouse club - Bulacao (saint Paul college)."
    ],
    "source_url": "https://cebujeepneys.weebly.com/10m.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "11A",
    "mode": "jeepney",
    "summary": "Inayawan Church ⇄ Colon St",
    "paths": [
      "Inayawan Church - Rizal Ave. - Tagunol St. - Mambaling Flyover - C. Padilla St. - Carlock St. - Spoliarium St. - Pasil - San Nicolas Parish - Magallanes St. - Basilica Menore del Sto Nino - D. Jakosalem St. - Gaisano Main - University of the Visayas - Colon St.",
      "Colon St. - Gaisano Main - 138 Mall - Colonnade Supermarket - Metro Gaisano - C. Padilla St. - Don Carlos Gothong High School - Jai-alai - Mambaling Flyover - Tagunol St. - Rizal Ave. - Cogon Pardo - Inayawan Church."
    ],
    "source_url": "https://cebujeepneys.weebly.com/11a.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "12D",
    "mode": "jeepney",
    "summary": "Punta Princesa ⇄ Cebu Metropolitan Cathedral",
    "paths": [
      "Punta Princesa - F. Llamas St. - Tisa - Labangon - Katipunan St. - Tres de Abril St. - N. Bacalso Ave. - Citilink - CCMC - Cebu South Bus Terminal - E Mall - ACT - P. del rosario St. -  University of San Carlos (main) - Junquera st. - Colon st. - Gaisano Main - University of the Visayas - P. Burgos St. - University of Southern Philippines Foundation - Cebu Metropolitan Cathedral.",
      "Colon to Labangon via Tres de Abril St.",
      "Cathedral - Legaspi St. - Colonnade supermarket - Pelaez St. - Sancianko St. - Sogo Hotel - GV Tower - UC - Leon Kilat St. - E. Mall - N. Bacalso Ave. - South Bus Terminal - Cebu City Medical Center - Citilink - Katipunan st. - Tres de Abril St. - Punta Princesa."
    ],
    "source_url": "https://cebujeepneys.weebly.com/12d.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "12G",
    "mode": "jeepney",
    "summary": "Sm City Cebu to Labangon via Katipunan St.",
    "paths": [
      "Sm City Cebu to Labangon via Katipunan St.",
      "Sm City Cebu to Labangon via Katipunan St.",
      "SM City Cebu PUJ Terminal - J. Luna Ave. - F. Cabahug St. - APM Mall - Cebu Institute Academy - Sergio Osmena Blvd. - Cebu Daily News - Pier 6 - Sugbutel - Pier 5 - PCSO - Pier 4 - T. Padilla st. - Martires - MJ. Cuenco Ave. - A. Bonifacio St. - Sikatuna St. - Parian Brgy. Hall - JC. Zamora st. - Sancianko St. - University of Cebu - Sogo Hotel - GV Tower Hotel - University of Cebu - E mall - Panganiban St. - CCMC - N. Bacalso Ave. - One Citilink Terminal - Katipunan St. - Labangon - F. Llamas st. - Brgy. Tisa - Punta Prinsesa - Tres De Abril st.",
      "Punta Prinsesa - Tres de Abril St. - Labangon - Carlock St. - B. Aranas St. - Taboan Public Market - Lakandula St. - San Nicolas Parish Church - Pasil Fish Market - Spolarium St - Magallanes St. - University of  San Jose Recoletos - Carbon Public market - Magellans Cross - Basilica del Sto. Nino - D. Jakosalem st. - MC. Briones St. - Cebu City Hall - Senior Citizens Park - La Nueva City Hall - Plaza Independencia - MJ. Cuenco ave. - Legaspi Ext. - Sergio Osmena Blvd. - Pier 3 - Pier 4 - Sugbutel Bed and Bath - Pier 5 - Pier 6 - Radisson Blu - Juan Luna Ave. - SM City Cebu - Sm Puj Terminal."
    ],
    "source_url": "https://cebujeepneys.weebly.com/12g.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "12I",
    "mode": "jeepney",
    "summary": "Sm City Cebu Puj Terminal ⇄ Punta Princesa",
    "paths": [
      "Sm City Cebu Puj Terminal - J. Luna Ave. - F. Cabajug St. - APM Mall - Cebu Institute Academy - Natasha - S. Osmena Blvd. - Radisson Blu - Sugbutel Bed and Bath - PCSO Main Office cebu - Robinsons Mall (reclamation area) - cebu technological university - Legaspit Ext. - Plaza Independencia - Port San Pedro - Legaspit St. - Metropolitan cebu Cathedral - Sto nino - V. Gullas St. - Manalili st. - Manila Foodshoppe - Pacific Tourist Inn - A. Borromeo St - Sancianko st. - Airol Pensione House - Panganiban St. - CCMC - N. Bacalso Ave. - Comglasco - Katipunan St. - Tres de Abril St - Punta Princesa.",
      "Punta Princesa - F. Llamas St. - Brgy Tisa - Gaisano Tisa - Katipunan St. - Brgy. Labangon - Tres de Abril st. - N. Bacalso Ave. - Citilink Terminal - CCMC - Cebu South Bus Terminal - E Mall - ACT - P. del rosario sT. - university of san carlos - Junquera St. - Colon St. - Gaisano Main - University of the Visayas - Colon Obelisk - P.Burgos St. - USPF - Cebu Metropolitan Cathedral - F. Urdaneta St. - MJ. Cuenco ave. - Legaspi Ext. - Plaza Indepnedencia - Fort San Pedro - Sergio Osmena Ave - Pier 3 - Pier 4 - pier 5 Robinsons Mall - PCSO - Sugbutel - SM City Cebu Terminal."
    ],
    "source_url": "https://cebujeepneys.weebly.com/12i.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "12L",
    "mode": "jeepney",
    "summary": "Punta Princesa Church ⇄ Ayala Center Cebu PUJ Terminal",
    "paths": [
      "Punta Princesa Church - Tres de Abril - Salvador St. - Katipunan St. - Tres de Abril St. - N. Bacalso Ave. - V. Rama Ave. B. Rodriguez Ave. - Fuente Osmena Circle - Robinsons Place Cebu (fuente) - Mango Ave. - Gen. Maxilom Ave. - Gorordo Ave. Cebu City Police Station - Ayala Road - Ayala Center Cebu PUJ Terminal.",
      "Ayala terminal - Harold Hotel - Escario St.- Cebu Provincial Capitol - M. Velez St. - Banawa - R. Duterte St. - Rustan's Supermarket (Banawa) - Salvador Extension - Katipunana St. - F. Llamas St. - Gaisano Capital (Tisa) - Brgy Tisa - Punta Princesa - Punta Princesa Church."
    ],
    "source_url": "https://cebujeepneys.weebly.com/12l.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "13B",
    "mode": "jeepney",
    "summary": "Carbon to Talamban via Ramos",
    "paths": [
      "Carbon to Talamban via Ramos",
      "Tintay - H. Abella St. - Gov. M. Cuenco Ave.  Talamban - Gaisano Grand Talamban - The Family Park - University of San Carlos(talamban) - Gaisano Country Mall - UC (banilad) - Arch. Reyes Ave. - Cebu Business Park - Mindanao Ave. - Ayala Center Cebu - Samar Loop - Luzon Ave. - Metro Ayala - Arch. Reyes Ave. - Gorordo Ave - Asilo dela Milagrosa church - Gen. Echavez St. - Allson's Inn - Sikatuna st. - D. Jakosalem St. - Echavez Ext. - Brgy Cogon Ramos - Ramos Public Market - Junquera Ext.- Junquera St. - University of San Carlos Main - Colon St.- Gaisano Main - University of the Visayas - Colon Obelisk - Mabini St. - V. Gullas St. - Manalili St. - Carbon Public Market - Progreso St.",
      "Carbon Public Market - MC. Briones St. - D. Jakosalem St. - Cebu City Hall - Magellans Cross - Basilica del Sto. Nino - The Freeman - Gaisano Main - University of the Visayas - Ramos Public Market - Zapatera Brgy. Hall - Sikatuna St. - Gen. Echavez St. - Gorordo ave. - Arch. Reyes Ave. - Cebu Business Park - Luzon Ave. - Ayala Center Cebu - Metro Ayala - Car. Rosales Ave. - Marriot Hotel - Mindanao ave. - Pag - ibib Fund - Arch. Reyes Ave. - Banilad - Gov. M. Cuenco Ave. - UC banilad - Gaisano Country Mall - University of San Carlos (talamban) - Talamban - The Family Park - Gaisano Grand Talamban - Tintay."
    ],
    "source_url": "https://cebujeepneys.weebly.com/13b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "13C",
    "mode": "jeepney",
    "summary": "Talamban ⇄ Colonnade Supermarket",
    "paths": [
      "Talamban - Gov. M. Cuenco Ave. - Gaisano Grand Mall (talamban) - University of San Carlos (talamban) - Banilad - Banilad Town Center - Gaisano Country Mall - University of Cebu (Banilad) - Paradise Village - Cebu Country Club - Samantabhadra Institute - Arch. Reyes Ave. - BIR - Cebu Business Park - Pag-ibig Fund - Ayala Center Cebu - Mindanao Ave. - Samar Loop - Luzon Ave. - Tune Hotels - Arch. Reyes Ave. - Hotel Elizabeth - Gorordo Ave. - Asilo dela Melagrosa - Camp Sutero (Cebu City Police office) - Gen. Echavez St. - Sikatuna St. - Parian - Colon St. - Gaisano Main - University of the Visayas - Colonnade Supermarket.",
      "Colon - Pelaez St. - University of San Carlos (Main) - P. del Rosario St. - Imus Ave. - M.J. Cuenco Ave. - Hipodromo - Mactan St. - Cebu Business Park - Leyte Loop - Samar Loop - Lexmark - Mindanao Ave. - Ayala Center Cebu - Arch. Reyes Ave. - BIR - Samantabhadra Institute - Gov. M. Cuenco Ave. - Banilad - UC (banilad) - Gaisano Country Mall - Banilad town center - foodland - University of San Carlos (Talamban) - Gaisano Grand Mall(talamban) - Talamban."
    ],
    "source_url": "https://cebujeepneys.weebly.com/13c.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "13H",
    "mode": "jeepney",
    "summary": "Pit-os ⇄ Mandaue City Public Market",
    "paths": [
      "Pit-os - Bacayan - Talamban Rd. - Cebu North General Hospital - Talamban - Gov. M. Cuenco Ave. - Gaisano Grand (talamban) - The Family Park - University of San Carlos (talamban) - Banilad - University of the Visayas (banilad) - Foodland - AS. Fortuna St. - Cebu Home & Builders - Oftana Suites - Allure Hotel & Suites - Benedicto College - J Centre Mall - The Orchard Cebu Hotel & Suites - Highway - AS. Fortuna St. Ext. - Andy Hotel - Guizo - A. del Rosario St. - Mantuyong - Sosyoland Supermarket - Colonnade Supermarket - North Reclamation Area - A. Soriano Ave. - Manduae City Sports Complex - Bureau of Internal Revenue - Mandaue City Public Market.",
      "(Merkado) New Manadaue City Public Market - Bureau of Immigration - PJ Burgos St. - Mandaue City Hall - St. Joseph Parish - St. Joseph Academy - Gaisano Grand Mall Mandaue - A. del Rosario St. - Mantuyong - Guizo - Collegio dela Immaculad Concepcion - Highway - San Miguel Brewery Plant - Coca-cola Bottlers corporation - AS. Fortuna St. - J Centre Mall - PLDT - Benedicto College - Larsian (Banilad) - Oftana Suites - Oakridge Business Park - Cebu Home & Builders - Banilad - Fords Inn - Foodland - University of the Visayas (banilad) - Bright Academy - University of San Carlos talamban - Talamban - The Family Park - Gaisano Grand Mall (talamban) - Talamban Elem. School - Talamban Brgy. Hall - Highway 11 - Talamban Rd. - Bacayan - Pit-os."
    ],
    "source_url": "https://cebujeepneys.weebly.com/13h.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "14D",
    "mode": "jeepney",
    "summary": "Ayala Terminal to Colon via F. Ramos St.",
    "paths": [
      "Ayala Terminal to Colon via F. Ramos St.",
      "Colon to Ayala Terminal via Fuente Osmena",
      "From ayala terminal - harolds hotel - escario st. - provincial capitol - jones avenue - fuente osmena circle - robinsons cybergate - chung hua hospital - robinsons place cebu (fuente) - f. ramos st. - saint paul college foundation (ramos) - university of san carlos - junquera st. - colon st.- gaisano main - university of the visayas - v. gullas st. - manalili st. - metro gaisano - osmena boulevard - landbank - central bank of the philippines - abellana sports complex - crown regency hotel - back to fuente osmena circle - jones avenue - escario st. - philhealth - back to ayala terminal.",
      "Colon to Ayala Terminal via Fuente Osmena",
      "metro gaisano - osmena boulevard - landbank - central bank of the philippines - abellana sports complex - crown regency hotel - back to fuente osmena circle - jones avenue - cebu doctors hospital - provincial capitol - escario st. - philhealth - golden peak hotel - back to ayala terminal."
    ],
    "source_url": "https://cebujeepneys.weebly.com/14d.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "15",
    "mode": "jeepney",
    "summary": "OPPRA ⇄ CARBON VIA OSMENA BLVD. AND VICE VERSA",
    "paths": [
      "OPPRA - CARBON VIA OSMENA BLVD. AND VICE VERSA"
    ],
    "source_url": "https://cebujeepneys.weebly.com/15.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "17B",
    "mode": "jeepney",
    "summary": "Apas ⇄ Progresso St",
    "paths": [
      "Apas - IT Park - Geonzon St - Salinas Drive - Jy square Mall - Gorordo Ave. - UP - Harolds Hotel - Escario St. - Provincial Capitol - Osmena Blvd - CDU - Fuente Osmena Circle - Robinsons Fuente - Crown Regency Hotel - Abellane Sports Complex - Jones Ave. - SSS - Metro Colon - P. Lopez St. - Magallanes St. - Manalili St. - Carbon Public Market - Progresso St.",
      "MC. Briones St. - Cebu City Hall - Basilica del Sto. Nino - La Nueva (cityhall) - Mj. Cuenco Ave. - Osmena Blvd - Lapulapu St. - Legaspi St. - Colonnade Supermarket - Pelaez St. - University of San Carlos - Osmena Blvd. - Cebu Normal University - Crown Regency Hotel - Robinsons Fuente - Fuente Osmena Circle - CDU - Provincial Capitol - Escario St. - Gorordo Ave - UP - Jy Square Mall - Salinas Drive - Geonzon St. - IT Park - Apas."
    ],
    "source_url": "https://cebujeepneys.weebly.com/17b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "17C",
    "mode": "jeepney",
    "summary": "Apas ⇄ Progresso st",
    "paths": [
      "Apas - IT Park - Salinas Drive - University of the Southern Philippines Foundation (Lahug) - Jy Square Mall - Gorordo Ave. - Lahug High School - University of the Philippines - Golden Peak Hotel - Philhealth - Royal Concourse - Asilo dela Milagrosa - Gen. Maxilom Ave. - Mango Ave. - Fooda Saversmart - Horizons 101 - Mango Square - The Beat - Robinsons Fuente - F. Ramos St. - Junquera St. - University of San Carlos Main - Sanciangko St. - University of Cebu Main - GV Tower - E Mall - Panganiban St. - Magallanes St. -  - University of San Jose-Recoletos - Carbon Public Market - F. Calderon st. - Progresso st.",
      "Carbon - MC. Briones St. - Cebu City Hall - Basilica del Sto. Nino - La Nueva Supermarket city hall - Lapulapu st. - MCWD - Legaspi St. -  Cebu Metropolitan",
      "Cathedral - D. Jakosalem St. - Gaisano Main - University of the Visayas - Cogon Ramos - Ramos Public Market - F. Ramos St. - Robinsons Fuente - Mango Ave. - Raintree Mall - Mango Square - Horizons 101 - Fooda Saversmart - Gen Maxilom Ave. - Gorordo Ave. - Royal Concourse - Philhealth - Golden Peak Hotel - Tonros Apartelle - Harolds Hotel - University of the Philippines - lahug - Jy Square Mall - Salinas Drive - W. Geonson St. - Cebu IT Park - Apas."
    ],
    "source_url": "https://cebujeepneys.weebly.com/17c.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "17D",
    "mode": "jeepney",
    "summary": "Apas to Carbon via Taboan",
    "paths": [
      "Apas to Carbon via Taboan",
      "Apas to Carbon via Taboan",
      "Apas - Wilson St. - Omega St. - San Miguel Rd. - IT Park - Aegis - Skyrise 1 - Skyrise 2 - Inez Villa St. - J. Maria del Mar St. - Skyrise 3 - Abad St. - W. Geonzon St. - Salinas Drive - University of Southern Philippines Foundation - JY Square Mall - Lahug - Gorordo Ave. - Mormons Church - University of the Philippines - Harolds Hotel - Morales St. - Escario St. - Cebu Provincial Capitol - Osmena Blvd. (Jones Ave. - Cebu Doctors Hospital - Fuente Osmena Circle - Robinsons Mall - Crown Regency Hotel & Suites - Abellana Sports Complex - Cebu Normal University - SSS - Sanciangko St. - GV Tower - UC Main - E Mall - Taboan Public Market - Taboan Dried Fish Market - Lakandula St. - San Nicolas Parish Church - Pasil Fish Market - Spolarium St. - Magallanes St. - University of San Jose-Recoletos - Carbon Public Market - F. Calderon St. - Progresso st. - MC. Briones St.",
      "Carbon Public Market - MC. Briones St. - Senior Citizens Park - Cebu City Hall - Basilica del Sto. Nino - La Nueva Supermart - Lapulapu St. - MCWD - DTI - Legaspi St. - Colonnade Supermarket - Cebu Century Hotel - Hotel de Mercedes - Pelaez St. - University of San Carlos Main - P del Rosario St. - Osmena Blvd. - Cebu Normal University - Abellana Sports Center - Crown Regency Hotel & Suites - Robinson Place - Fuente Osmena Circle - Cebu Doctors Hospital - Cebu Provincial Capitol - N. Escario St. - Cebu Grand Hotel - Philhealth - Golden Peak Hotel - Gorordo Ave. - Turtles Nest - Handuraw Pizza - University of the Philippines - Lahug - Mormons Church - Jy Square Mall - Salinas Drive - USP-F - W. Geonzon St. - Abad St. - IT Park - Convergys - J. Maria del Mar St.- Skyrise 3 - Inez Villa St. - Skyrise 1 - Skyrise 2 - Aegis - Sn Miguel Rd. - Omega St. - Wilson St. -"
    ],
    "source_url": "https://cebujeepneys.weebly.com/17d.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "20A",
    "mode": "jeepney",
    "summary": "ayala terminal ⇄ Department of Foreign Affairs(mandaue)",
    "paths": [
      "ayala terminal - mabolo - subandako - wireless - tipolo - san miguel corporation - Parkmall - CICC - Guizo - Uwell - Mantuyong - Sosyoland Supermarket - Colonnade Supermarket - North reclamation area - mandaue public market (NEW) - BIR (mandaue)  - Bureau of Immigration - Mandaue City Hall - Saint Joseph Parish - SB. Cabahug St. - Mandaue Colliseum - Estancia-ibabao - Super Metro Mandaue - Pacific Mall - Department of Foreign Affairs(mandaue)",
      "Pacific Mall - Super metro mandaue - UN Ave. - Plaridel St. - AC Cortes Ave. - Maguikay Flyover - Hi-way - Coca Cola plant - San Miguel Plant - tipolo - Wireless - Subangdako - Mabolo - Dela Montana St. (Pope John Paul Ave.) - Cardinal Rosales Ave. - Mindanao ave. - Ayala Terminal",
      "Ayala Terminal - Hipodromo - Mabolo - Subangdako - Wireless - Tipolo - San Miguel Brewery Plant - Coca Colo Bottlers Plant - Hi-way - Maguikay Flyover - Estancia (ibabao).",
      "Ibabao (Estancia) - SB. Cabahug St. - A del Rosario St. - Gaisano Grand Mandaue - Uwell - Guizo - San Miguel Brewery Plant - Tipolo - Wireless - Subangdako - Mabolo - Pope John Paul Ave. - Cardinal Rosales ave. - Mindanao Ave. - Bohol Ave. - Ayala Terminal."
    ],
    "source_url": "https://cebujeepneys.weebly.com/20a.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "20B",
    "mode": "jeepney",
    "summary": "Ayala terminal ⇄ ibabao (estancia)",
    "paths": [
      "Ayala terminal - mabolo - subandako - wireless - tipolo - San miguel brewery plant - coca cola bottlers plant - maguikay flyover - ibabao (estancia).",
      "ibabao (estancia) mandaue colliseum - sb cabahug st. - centro mandaue - gaisano grand (centro mandaue) - a. del rosario st. - guizo mandaue - caltex ( san miguel brewery) - tipolo - wireless - subandako - mabolo - cebu business park - ayala terminal.",
      "Ayala terminal - Mabolo - Subandako - Wireless - Tipolo - CICC - Parkmall - A. del Rosario St. - Uwell - Sosyoland supermarket - Colonnade supermarket - north reclamation area - Mandaue public market - Bureau of Immigration - Mandaue City Hall - Gaisano Grand (mandaue) - SB. Cabahug St. - Mandaue Colliseum - Estancia (ibabao) - Pacific Mall - Super Metro Mandaue.",
      "Ayala terminal - Mabolo - Subandako - Wireless - Tipolo - CICC - Parkmall - A. del Rosario St. - Uwell - Sosyoland supermarket - Colonnade supermarket - north reclamation area - Mandaue public market - Bureau of Immigration - Mandaue City Hall - Gaisano Grand (mandaue) - SB. Cabahug St. - Mandaue Colliseum - Estancia (ibabao) - Pacific Mall - Super Metro Mandaue."
    ],
    "source_url": "https://cebujeepneys.weebly.com/20b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "21A",
    "mode": "jeepney",
    "summary": "Cathedral ⇄ DFA",
    "paths": [
      "Cathedral - MJ. Cuenco Ave. - CTU - NSO - Museo Subgo - CPILS - Imus Ave. - MJ. Cuenco Ave. - Carreta Cemetery - Hipodromo - The Persimmon - Mabolo Church - Mabolo - Subandaku - Innodata - Wireless - Tipolo - CD Seno St. - AS. Fortuna St. - Guizo - Mantuyong - Centro Mandaue - Sosyoland supermarket - Colonnade Supermarket - New Mandaue Public Market - BIR - Bureau of Immigration - Mandaue City Hall - St Joseph Parish - SB. Cabahug St. - Mandaue Coliseum - Esrancia - Pacific Mall - Super Metro Mandaue - DFA.",
      "Pacific Mall (super Metro Mandaue) - UN ave. - Plaridel St. - AC. Cortes ave. - Prince Warehouse Mandaue - Cebu Coliseum - Maguikay Flyover - MC. Briones hi-way - Coca cola Bottlers Plant - San Miguel Brewery Plant - Tipolo - Wireless - Albano St. - M. Logarta Ave. - Cebu Noth Bus Terminal - SM Hypermarket - Sm City Cebu - A. Soriano Ave. - White Gold Club - G. Gasiano St. - T. Padilla St. - Pier 4 - Sergio Osmena Blvd. - V. Sotto St. - CTU - V. Gullas St. - P. Burgos St. - Cathedral .",
      "metropolitan cathedral - MJ. Cuenco ave. - CTU - NSO - Museo Sugbo - CPILS - Imus Ave. - DSWD - Carreta Cemtery - Hipodromo - mabolo - subangdaku - Innodata - Wireless - Tipolo - San Miguel Bottling Plant - Coca cola Bottlers Plant - As. Fortuna St. - J. mall - V. Albano St. - M.L. Quezon St. - Maguikay Flyover - MC. Briones St. - Ibabao (Estancia)",
      "ibabao (estancia) - SB. Cabahug St. - Mandaue Coliseum - Cortes Gerneral Hospital - A. del Rosario St. - Gaisano Grand (centro Mandaue) - Brgy Mantuyong - Brgy Guizo - San Miguel Brewery Plant - Tipolo - Wireless - Subandako - Albano St. - Cebu North Bus Terminal - Aboitiz Football Field - Sm Hypermarket - Sm City Cebu - APM - A. Soriano Ave. - White Gold Club - Queen City Memoria Garden - Queensland - White Gold House - G. Gaisano St. - B. Benedicto St. - T. Padilla St. - S. Osmena Blvd. - Pier 4 - Pier 3 - V. Sotto st. - CTU - MJ. Cuenco Ave. - V. Gullas St. - P. Burgos St. - Plaza Humabon - cebu metropolitan Cathedral."
    ],
    "source_url": "https://cebujeepneys.weebly.com/21a.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "21D",
    "mode": "jeepney",
    "summary": "cathedral ⇄ super metro mandaue",
    "paths": [
      "cathedral - plaza independencia - pier 3 - pier 4 - t. padilla st. - b. benedicto st. - white gold house - a. soriano ave. - white gold club - queen city memorial garden - sm city cebu - sm hypermarket - aboitiz football field - cebu north bus termina - M. Logarta ave. - wireless - tipolo - san miguel brewery - parkmall - CICC - guizo - uwell - centro mandaue - sioland supermarket - colonnade supermarket - new mandaue public market - bureau of immigration - pj burgos st. - mandaue city hall - st. joseph parish - s.b. cabahug st. - mandaue coliseum - brgy estancia - pacific mall - super metro mandaue.",
      "pacific mall - super metro mandaue - un. avenue - hi-land - plaridel st. - total gas station - a.c. cortez st. - prince warehouse club mandaue - mandaue coliseum - maguikay flyover - hi-way - coca-cola bottlers plant - san miguel brewery plant - tipolo - wireless - subangdako - andoks mabolo - mabolo church - hipodromo - m.j. cuenco ave. - imus ave. - m.j. cuenco ave. - CPILS - cor. t. padilla st. - brgy tejero - NSO - CITU - cebu metropolitan cathedral.",
      "cebu metropolitan chathedral - plaza independencia - Pier 3 - Pier 4 - white gold house - a. soriano ave. - white gold club - SM City Cebu - Sm Hypermarket - Aboitiz Football Field - Cebu North Bus Terminal - Wireless Flyover - Lopez Jaena St. - Tipolo - San Miguel Brewery Plant - Coca Cola Bottlers Plant - A.S. Fortuna st. - J Mall - V. Albano St. - M.L. Quezon St. - maguikay flyover - ibabao - estancia.",
      "Brgy estancia (ibabao) - mandaue coliseum - S.B. Cabahug St. - A. del Rosario St. - Gaisano Grand Mall (centro mandaue) - guizo - San Miguel Brewery Plant - Tipolo - Wireless - Subangdako - M.J. Cuenco Ave. - Mabolo - Carreta - CPILS - museo sugbo - NSO - CTU - V. Gullas St. - P. Burgos St. - plaza humabon - cathedral."
    ],
    "source_url": "https://cebujeepneys.weebly.com/21d.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "22A",
    "mode": "jeepney",
    "summary": "Cathedral ⇄ Ouano",
    "paths": [
      "Cathedral - F. Urdaneta St. - MJ. Cuenco Ave. - CTU - NSO - CPILS - Museo Sugbo - DSWD - Carreta Cemetery - Hipodromo - The Persimmon - Mabolo - Lopez Jaena St. - Subangdako - Wireless - Tipolo - A. del Rosario St. - San Miguel Brewery Plant - C.D. Seno St. - W.O. Seno St. - Parkmall - CICC - As. Fortuna St. ext. - A. del Rosario St. - Mantuyong - Centro Mandaue - Sosyoland Supermarket - Colonnade Supermarket - Ouano Ave. - A.Soriano Ave. - New Mandaue Public Market - BIR Mandaue - A. Soriano Ave. - JL. Briones St - A. Mabini St. - Ouano.",
      "Ouano - Mandaue City Hall - Gaisano Grand (Mandaue) - A. del Rosario St. - Mantuyong - Guizo - San Miguel Brewery Plant - Tipolo - Wireless - Subangdako - Albano St. - Cebu North Bus Terminal - Aboitiz Football Field - SM Hypermarket - APM - Sm City Cebu - A. Soriano Ave. - Queen City Memorial Garden - White Gold Club - White Gold House - G. Gaisano St - B. Benedicto St. - T. Padilla St. - S. Osmena Blvd. - Pier 4 - Pier 3 - V. Sotto St. - Mj. Cuenco Ave. - CTU - V. Gullas St. - P. Burgos ST. - Plaza Humabon - Cathedral."
    ],
    "source_url": "https://cebujeepneys.weebly.com/22a.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "22D",
    "mode": "jeepney",
    "summary": "Cathedral ⇄ Ouano",
    "paths": [
      "Cathedral - F. Urdaneta St. - Plaza Independencia - Legaspi Ext. - S. Osmena Blvd. - Pier 3 - Pier 4 - 13th Ave. - B. Benedicto St. - Gen. Maxilom Ave. Ext. - A. Soriano Ave. - White Gold Club - Queen City Memorial Gardens - Sm City Cebu - F. Cabahug St. - M. Logarta St. - Sm Hypermarket - M. Logarta Ave. - Aboitiz Football Field - Cebu North Bus Terminal - Wireless Flyover - Lopez jaena St. - Tipolo - San Miguel Brewery Plant - A. del Rosario St. - C.D. Seno St. -Parkmall - CICC - W.O. Seno St. - A.S Fortuna St. Ext. - A. del Rosario St. - Uwell - Mantuyong - Sosyoland Supermarket - Colonnade Supermarket - A. Soriano Ave. - New Public Market - A. Mabini St. - Ouano.",
      "Ouano - A. Mabini St. - P.J. Burgos St. - Mandaue City Hall - Gaisano Grand Mandaue - A. del Rosario St - Mantuyong - Guizo - San Miguel Brewery Plant - MC. Briones St. - L. Jaena St. - Tipolo - Wireless - Ginebra San Miguel Inc. - Innodata - Subangdako - MJ. Cuenco Ave. - Mabolo - The Persimmon - Hipodromo - Cebu Chinese Cemetery - Carreta Cemetery - Imus Ave. - MJ. Cuenco Ave. - Museo Sugbo - CPILS - NSO - CTU - V. Gullas St. - Plaza Humabon - Cathedral."
    ],
    "source_url": "https://cebujeepneys.weebly.com/22d.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "22G",
    "mode": "jeepney",
    "summary": "Cathedral ⇄ Ouano",
    "paths": [
      "Cathedral - F. Urdaneta St. - MJ. Cuenco Ave. - CTU - NSO - T. Padilla St. - B.Bendicto  St. - G.maxilom ave. ext. - A. Soriano Ave. - White Gold Club - Sm City Cebu - F. Cabahug St. - APM mall - M.Logarta St. - Sm Hypermarket - Aboitiz Football field - Cebu North Bus Terminal - L.Jaena St. - Wireless - Tipolo - A. del rosario St. - CD. Seno St. - CICC -  WO. Seno St. - AS. Fortuna St. Ext. - A. del Rosario St. - Guizo - Mantuyong - uwell -  B. Ceniza St. - Sosyoland supermarket - Colonnade Supermarket - A. Soriano Ave. - New Mandaue Public Market - Bir Mandaue - JL. Briones St. - Norkis Park - A. Mabini St. - Ouano.",
      "Ouano - A. Mabini St. - PJ. Burgos St. - St. Joseph Parish - Mandaue City Hall - Gaisano Grand Mandaue - A. del Rosario St. - Mantuyong - Guizo - SSS(mandaue) - San Miguel Brewery Plant - MC. Briones St. - L. Jaena St. - Tipolo - Wireless - Subangdako - Mabolo (Andoks) - Pope J.Paul II Ave. - Sm City Cebu - A. Soriano Ave. - Queen City Memorial Garden - White Gold Club - Queensland - G. Maxilom Ave. Ext. - G.Gaisano St. - T. padilla st. - S. Osmena Blvd. - Pier 4 - Pier 3 - V. Sotto St. - CTU - MJ. Cuenco Ave. - V. Gullas St. - P.Burgos St. - Cathedral."
    ],
    "source_url": "https://cebujeepneys.weebly.com/22g.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "22I",
    "mode": "jeepney",
    "summary": "Country Mall ⇄ Bureau of Immigration",
    "paths": [
      "Country Mall - Gov. M.Cuenco Ave. - Banilad Town Center - A.S. Fortuna St. - J Centre Mall - A. del Rosario St. - UWELL - B. Ceniza St. - Sosyoland Supermarket - Colonnade Supermarket - A. Soriano Ave. - Mandaue Public Market. - Bureau of Immigration.",
      "Mandaue Public Market - Bureau of Immigration - Mandaue City Hall - St. Joseph Parish - St. Joseph Academy - A. del Rosario St. - Gaisano Grand mall mandaue -  Mantuyong - Guizo - Collegio dela Immaculad Concepcion - San Miguel Corporation (highway) - MC. Briones St. - A.S. Fortuna St. - Norkis - J Centre Mall - Benedicto College -  Larsian Banilad - Cebu Home and Builders - Foodland - Banilad Flyover - Gov. M. Cuenco ave. - Banilad Town Center - Robinsons Supermarket (banilad) - Country mall - *optional (Paradise)"
    ],
    "source_url": "https://cebujeepneys.weebly.com/22i.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "23",
    "mode": "jeepney",
    "summary": "Parkmall ⇄ Hilton Resort",
    "paths": [
      "Parkmall - W.O. Seno St. - Chung Hua Hospital (ongoing) - MO2 - E.O. Perez St. - S&R Membership Shopping - P. Larazzabal Ave. - Cebu Doctors University - Ouano Ave. - St. James Amusement Park - A. Soriano Ave. - Mandaue City College - BIR mandaue - New Mandaue City Public Market - Jose L Briones Ave. - Norkis Park - University of the Visayas (mandaue) - Hotel Nenita - Plaridel St. - Metro Fresh & Easy (Tita Gwapa) - Umapad - Bridges Town Square - UN. Ave. - New Mactan-Mandaue Bridge - Pusok - Quezon National Highway - Marina Mall - Savemore Mactan - Mepz 1 - Gate 1, 2, 3, 4, 5 - Ibo - Buaya - Punta Engano Rd. - Brgy. Mactan - Mactan Shrine - Lapulapu Monument - Punta Engano - Shanrila's Mactan Resort & Spa - Movenpick Resort - Cebu Paradive Resort - Abaca Boutique Resort - Be Resort - Palm Beach Resort & Spa - Cebu Sea World - Casa Carmela Mactan Resort - Amisa Residences - Discovery Bay Hotel - Hilton Resort.",
      "Punta Engano - Hilton Resort - Discovery Bay Hotel - Amisa Residences - Punta Engano Rd. - Casa Carmela Mactan Resort - Cebu Sea World - Palm Beach Resort & Spa - Be Resort - Abaca Boutique Resort - Cebu Paradive Resort -",
      "Movenpick Resort - Shangrila's Mactan Resort & Spa - Lapulapu Monument - Mactan Shrine - Brgy. Mactan Quezon National Highway  - Buaya - Ibo - MEPZ 1 - Gate 4, 3, 2, 1 - Savemore Mactan - Marina Mall - Pusok - New Mactan Mandaue Bridge - UN. Ave. - Umapad - Plaridel St. - Bridge Town Square - Hotel Nenita - AC. Cortes Ave. - Prince Warehouse Club (mandaue) - STI  College - B.B. Cabahug St. - A. del Rosario St. - Tipolo (San Miguel Corp.) - C.D. Seno St. -  - CICC - W.O. Seno St. - Parkmall."
    ],
    "source_url": "https://cebujeepneys.weebly.com/23.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "23D",
    "mode": "jeepney",
    "summary": "Opon PUJ terminal ⇄ Parkmall",
    "paths": [
      "Opon PUJ terminal - ML. Quezon Ave. - OLD Mactan-Mandaue Bridge - AC. Cortes Ave. - UCLM - Natures Spring Plant - Mandaue Coliseum - STI - B. B. Cabahug St. - Mandaue Catholic Cemetery - A. del Rosario St. - Guizo - C.D. Seno - Cicc - Parkmall.",
      "Parkmall - W.O. Seno St. - E.O Perez St. - S&R Shopping - P. Larazzabal Ave. - Cebu Doctors University - Ouano Ave. - CICC - New Mandaue Public Market - J.L. Briones St. - Norkis Park - University of the Visayas - AC. Cortes Ave. - Natures Spring Plant - UC-LM - Old  Mandaue-Mactan Bridge - ML. Quezon Ave. - General Milling Corp. - Metro Mactan - Mantawe Rd. - Ompad St. - GY dela Serna St. - La Nueva Supermart - Opon PUJ terminal."
    ],
    "source_url": "https://cebujeepneys.weebly.com/23d.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "24",
    "mode": "jeepney",
    "summary": "Consolacion to White Gold via Mabolo",
    "paths": [
      "Consolacion to White Gold via Mabolo",
      "Consolacion - Sm Consolacion - Fooda Consolacion - cor. Canduman - Basak - Insular Square - Mandaue City - Pacific Mall - Super Metro Mandaue - Highway - Tipolo - Wireless - Subangdako - Innodata - Mabolo - Sm City Cebu - White Gold Club - White Gold Terminal.",
      "White Gold Terminal - Sm City Cebu - Sm Hypermarket - Cebu North Bus Terminal - Wireless - Subangdako - Tipolo - Highway - AS Fortuna St. - J. Mall - Maguikay - Pacific Mall - Super Metro Mandaue - Paknaan - Basak - Cor. Canduman - Consolacion - Fooda Consolacion - Sm City Consolacion - Bagong Daan."
    ],
    "source_url": "https://cebujeepneys.weebly.com/24.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "25",
    "mode": "jeepney",
    "summary": "Liloan to White Gold via Wireless",
    "paths": [
      "Liloan to White Gold via Wireless",
      "White Gold to Liloan via Highway",
      "Liloan - consolacion - sm consolacion - fooda consolacion - mandaue city - jagobiao - canduman - basak - insular square - paknaan - mc briones st. - super metro mandaue - pacific mall - DFA - maguikay - highway - coca cola plant - san miguel plant - lopez jaena st. - tipolo - wireless - albano st. - north bus terminal -  M. logarta ave. - aboitiz sports field - sm hypermarket - sm city cebu - f. cabahug st. - sergio osmena blvd. - gen. maxilom ave. ext. - robinsons galleria cebu - a. soriano ave. - white gold club. - white gold terminal.",
      "White Gold - a. soriano ave. - sm city cebu - f. cabahug st. - M. logarta st. - sm hypermarket - aboitiz sports field - north bus terminal - wireless fly-over - Lopez jaena st. - tipolo - mc briones st. - san miguel plant - coca cola plant - highway - Maguikay flyover - DFA - super metro mandaue - pacific mall - cebu north road - paknaan - basak - canduman - jagobiao - abs-cbn- consolacion - fooda consolacion - sm consolacion - liloan"
    ],
    "source_url": "https://cebujeepneys.weebly.com/25.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "62B",
    "mode": "jeepney",
    "summary": "Pit-os ⇄ Progreso St",
    "paths": [
      "Pit-os - Bacayan - Talamban - Gov. M. Cuenco Gaisano Talamban - The Family Park - University of San Carlos (talamban campus) - Gaisano Country Mall - UC-Banilad - Banilad - Pope John Paul 2 Ave. - Cebu Business Park - Ayala Center Cebu - Marriot Hotel - Samar Loop - Luzon Ave. - Arch. Reyes Ave. - Gorordo Ave. - Asilo dela Milagrosa - Gen. Echavez St. - Sikatuna St. - Zapatera - colon Obelisk - V. Gullas St. - Manalili St. - Carbon Public Market - Progreso St.",
      "Carbon Public Market - MC. Briones St. - D. Jakosalem St. - Cebu City Hall - Basilica del Sto. Nino - The Freeman - Gaisano main - University of the Visayas - Imus Ave. - Gen. Maxilom Ave.( Mango Ave.) - Sorsogon Rd. - Negros Rd. - Cardinal Rosales Ave. - Luzon Ave. - Metro Ayala - Ayala PUJ Terminal - Arch. Reyes Ave. - Quest Hotel - Honkong Plaza Hotel - Gov. M. Cuenco Ave. - Banilad - Gaisano Country Mall - BTC - Foodland - Univesity of San Carlos (Talamban) - The Family Park - Talamban - Gaisano Grand Talamban - Talamban Rd. - Bacayan - Pit-os"
    ],
    "source_url": "https://cebujeepneys.weebly.com/62b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "62C",
    "mode": "jeepney",
    "summary": "Pit-os ⇄ Progreso st",
    "paths": [
      "Pit-os - Talamban - Gaisano Grand Talamban - USC-talamban - Banilad - Gaisano Country mall - Gov. M.Cuenco ave. - Juan Luna Ave. - Sn. Carlos Seminary College - C. Rosales Ave. - Ayala Center Cebu - Keppel - Samar Loop - Luzon Ave. - Arch. Reyes ave. - Hotel Elizabeth - Asilo dela Milagrosa - Gorordo ave. - G. Echavez St. - Sikatuna St. - D. Jakosalem st. - Ramos Public Market - Junquera St. ext. - Junquera st. - University of San Carlos (main) - Colon St. - Gaisano Main - University of the visayas - P. Burgos St. - V. gullas st. - Manalili st. - Carbon Public Market - Progreso st.",
      "Carbon - MC. Briones St. - Cebu City Hall - D. Jakosalem St. - Basilica del Sto. Nino - Gaisano Main - University of the Visayas - Ramos Pub. Market - Bayantel - Sikatuna St. - Gen. Echavez St. - Gorordo Ave. - Arch. Reyes Ave. -Ayala Puj Terminal - BIR - Gov. M. Cuenco Ave. - Paradise Village - G. Country Mall - University of Cebu-(banilad) - BAnilad - Banilad town center - Foodland - USC(talamban) - Talamban - Bacayan - Pit-os"
    ],
    "source_url": "https://cebujeepneys.weebly.com/62c.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "MI-01A",
    "mode": "jeepney",
    "summary": "Punta Engano ⇄ Opon Public Market",
    "paths": [
      "Punta Engano - Mactan Shrine - Mepza - Marina Mall - Pusok - SSS - Lapulapu City Hall - Gaisano Island Mall - Metro-lapulapu - Opon Public Market.",
      "Opon Public Market to Metro-lapulapu - Gaisano Island Mall - Lapulapu City Hall - SSS - Pusok - Marina Mall - Mepza - Ibo - Mactan Shrine - Shangrila Hotel - Punta Engano."
    ],
    "source_url": "https://cebujeepneys.weebly.com/mi-01a.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "MI-02B",
    "mode": "jeepney",
    "summary": "(Mandaue) Parkmall ⇄ Metro express Maribago",
    "paths": [
      "(Mandaue) Parkmall - W.O. Seno St. - E.O Perez St. - S&R Membership Shopping - P. Larrazabal Ave. - Cebu Doctors University - Ouano Ave. - St. James Amusement Park - CICC - A. Soriano Ave. - New Manadue  Public Market - Mandaue City Hospital - Jose L. Briones St. - University of the Visayas (mandaue) - Plaridel St. - Bridges Town Square - Highland - Total - UN Ave. - Brgy Umapad - New Mactan-Mandaue Bridge - Pusok - ML. Quezon Ntnl Highway - Marina Mall - Mepz 1 - Gate 1, 2, 3, 4, 5 - Ibo - Mactan - Punta Engano Rd. - Mactan Ocean Town - Maribago - Maribago Blue Waters - Cebu White Sands - Save More Maribago - Metro express Maribago.",
      "Maribago - Cebu White Sands - Maribago BlueWater resort - Brgy. Mactan - Mactan Oceantown - Quezon National Highway - Ibo - Mepz 1 - Gate 1, 2, 3, 4, 5 - Marina Mall Savemore Mactan - Pusok - Marcelo B. Fernan Bridge - UN ave. - Highland - Plaridel St. - Bridges Town Square - AC Cortes Ave. - Prince Warehouse (mandue) - Mandaue Coliseum - STI College (mandaue) - BB Cabahug St. - Mandaue Catholic Cemtery - Brgy. Guizo - A. del Rosario St. - SSS(mandaue) - Highway - Tipolo (San Miguel) - CD. Seno St. - Hall of Justice - WO. Seno St. - Parkmall."
    ],
    "source_url": "https://cebujeepneys.weebly.com/mi-02b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "MI-03A",
    "mode": "jeepney",
    "summary": "Cordova ⇄ Lapulapu City Public Market",
    "paths": [
      "Cordova - Babag 2 - Deca Homes - Babag 1 - Tiangue Rd. -Looc - Lapulapu City Central School - GY. dela Serna St. - Yanadia - S. Osmena St. - Lapulapu City Public Market",
      "Lapulapu City Public Market (opon) - L. Jaena St. - P. Rodriguez St. - Lapu lapu city Central School - Tiangue Rd. - Looc - Babag 1 - Deca Homes - Babag 2 - Cordova."
    ],
    "source_url": "https://cebujeepneys.weebly.com/mi-03a.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "MI-03B",
    "mode": "jeepney",
    "summary": "There are 2 types of MI-03B routes in Mactan. (1) from Mepz 1 to cordova via Muelle Osmena Port (Ferry boat terminal) and vice versa. (2) Mepz 1 to Cordova via Hoops Dome and vice versa.",
    "paths": [
      "There are 2 types of MI-03B routes in Mactan. (1) from Mepz 1 to cordova via Muelle Osmena Port (Ferry boat terminal) and vice versa. (2) Mepz 1 to Cordova via Hoops Dome and vice versa.",
      "Cordova to Mepz 1 via opon public market",
      "Mepz 1 to Cordova via Muelle Osmena Port",
      "Cordova to Mepz 1 via Opon Public Market",
      "Cordova - Quezon National Highway - Cordova Terminal - Babab 2 - Pilipog - Mactan Circumferential Rd. - Babag 1 - Deca Homes - Canjulao - Looc - Lapu2x City Central School - GY. dela Serna St. - Opon Public Market - Lapulapu City Public Market - La Nueva Supermart - GV Hotel - Metro Gaisano (opon) - General Milling Corp. - ML Quezo Ave. - Gaisano Mactan - Lapulapu City Hall - Goldberry Hotel and Suites - The Villavista Hotel - Pusok - Lancaster Hotel - Marina Mall - Savemore supermarket (mactan) - mepz 1 - gate 1 -",
      "Mepz 1 to Cordova via Mactan Ferry Terminal",
      "Mepz 1 - Gate 4 - Gate 3 - Taiyo Yuden - Lear - Gate 2 - Gate 1 - Marina Mall - Savemore supermarket (mactan) - Pusok - ML Quezon ave. - The Bellavista Hotel - Goldberry Hotel & Suites - Lapulapu City Hall - Sss (lapulapu) - Gaisano Mactan Island Mall - Dulcenia Hotel and Suites - General Milling Corp. - Metro Gaisano Mactan - Mantawe Rd. - BM. Dimataga St. - Poblacion - Opon Plaza - Mactan Ferry Boat Terminal - Birhen Sa Regla (opon) - R. Rodriguez St. - Lapulapu City central School - Tiangue Rd. - Looc - Babab 1 - Deca Homes -  Babag 2 - Cordova.",
      "Cordova to Mepz 1 via Hoops Dome",
      "Mepz 1 to Cordova via Hoops dome",
      "Cordova to Mepz 1 via Hoopsdome",
      "Cordova - babag 2 - Tiangue Rd. - Babag 1 - A. Tumulak St. - Gun-ob - S. Osmena St. - Hoops Dome - MV. Patalinghug Ave. - Quezon National Highway - Gaisano Mactan Island Mall - Lapulapu City Hall - Pusok - Marina Mall - Savemore market - Mepz 1 - Gate 1 - gate 2 - gate 3 - gate 4.",
      "Mepz 1 to Cordova via Hoops Dome",
      "Mepz 1 - gate 4 - gate 3 - gate 2 - gate 1 - Pusok - Quezon ave. - lapulapu city hall - Gaisano mactan island mall - MV. Patalinghug Ave. - Humay humay Rd. - Hoops Dome - S. osmena St. - Gun-ob - A. Tumulak St. - Cajulao - Tiangue Rd. - Babag 1 - Deca Homes -  Babag 2 - Cordova."
    ],
    "source_url": "https://cebujeepneys.weebly.com/mi-03b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "MI-04A",
    "mode": "jeepney",
    "summary": "tamiya to mandaue via Parkmall",
    "paths": [
      "tamiya to mandaue via Parkmall",
      "(Tamiya to Mandaue via Parkmall)",
      "A. del Rosario St. - C.D. Seno St. - Hall of Justice (mandaue) - Parkmall - W.O. Seno St. - E.O. Perez St. - P. Larazzabal Ave. - CDU - F.F. Cruz St. - Ouano Ave. - St. James Amusement Park - A. Soriano Ave. - Mandaue City Hospital - Jose L. Briones St. - A.C. Cortez Ave. - UCLM - Mactan Mandaue Bridge (OLD) - M.V. Patalinghug Ave. - Crown Regency Suites Mactan - Robinsons Supermarket mactan - Tamiya Terminal.",
      "Tamiya Terminal(MEPZ 2) - Robinsons Supermarket(mactan) - Marigondon to Basak Road - Crown Regency Suites(mactan) - Mandaue Mactan Bridge(OLD) - UC-LM - A.C. Cortes Ave. - Prince Warehouse Club (mandaue) - B.b. Cabahug St. - A. del Rosario St.",
      "Tamiya to Mandaue via Parkmall",
      "(Tamiya to Mandaue via J Mall)",
      "Tamiya terminal (Mepz 2) - Maximo V. Patalinghug Ave. - Crown Regency Suites - Old Mactan Mandaue Bridge - UCLM - PSWRI -  A.C. Cortes Ave. - Mandaue Coliseum - STI Mandaue - Maguikay Flyover - MC Briones St. -  Highway - A.S/ Fortuna St. - J Centre Mall (Teminal).",
      "J Centre Mall - V. Albano St. - ML Quezon St. - Maguikay - Savemore (maguikay)  Maguikay Flyover - A.C. Cortes Ave. - STI (mandaue) - Mandaue Coliseum - PSWRI - University of Cebu - LM - OLD Mactan-Mandaue Bridge - M.V. Patalinghug Ave. - Crown Regency Suites (mactan) - Pueblo Verde - Robinsons Supermarket (mactan) - Tamiya Terminal - Mepz 2.",
      "(Tamiya to Mandaue via J Mall)"
    ],
    "source_url": "https://cebujeepneys.weebly.com/mi-04a.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "MI-04B",
    "mode": "jeepney",
    "summary": "Tamiya Terminal ⇄ Gate 4",
    "paths": [
      "Tamiya Terminal - Robinsons Supermarket (Pueblo Verde) - MV. Patalinghug Jr. Ave. - Crown Regency Suites - Quezon National Highway - Gaisano Mactan Island Mall - Lapu-lapu City Hall - Dulcinea Hotel Suites - SSS - The Bellavista Hotel - Goldberry Suites and Hotel - Pusok - Marina Mall - Savemore Mactan - Mepz 1 - Gate 1 - Gate 2 - Gate 3 - Gate 4.",
      "Mepz 1 - Gate 4, 3, 2, 1 - Marina Mall - Savemore Mactan - Quezon National Highway - Pusok - The Bellavista Hotel - Goldberry Suites & Hotel - SSS - Lapu-lapu City Hall - Gaisano Mactan Island Mall - MV. Patalinghug Jr. Ave. - Crown Regency Suites - Pueblo Verde - Robinsons Mactan - Tamiya Terminal - Mepz 2."
    ],
    "source_url": "https://cebujeepneys.weebly.com/mi-04b.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  },
  {
    "code": "MI-05A",
    "mode": "jeepney",
    "summary": "Mactan Airport ⇄ General Milling Corporation -",
    "paths": [
      "Mactan Airport - Marina Mall - Quezon National Highway - Pusok - Hotel Cesario - SSS (Lapu2x branch) - Lapulapu City Hall - Gaisano Mactan Island Mall - General Milling Corporation -",
      "Gaisano Metro (opon) - Mantawe Road - B.M. Dimataga St. - Muelle Osmena Port - Cebu-Mactan Ferry Terminal.",
      "Muelle Osmena Port (Cebu-mactan Ferry Terminal) - Our Lady of Rule Parish - R. Rodriguez St. - G.Y. dela Serna St. - Opon Public Market - La Nueva Supermart - M.L. Quezon Ave. - Gaisano Metro (opon) - Gaisano Mactan Island Mall - Lapulapu City Hall - Pusok - Marina Mall - Mactan Cebu International Airport Authority."
    ],
    "source_url": "https://cebujeepneys.weebly.com/mi-05a.html",
    "fetched_date": "2026-06-13",
    "status": "unverified"
  }
];
