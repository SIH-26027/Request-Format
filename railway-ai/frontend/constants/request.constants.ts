import { 
  DepartmentCode, 
  DepartmentInfo, 
  PriorityLevel, 
  UrgencyLevel, 
  RequestStatus, 
  TrackLineType, 
  EngineeringAssetType, 
  TRDAssetType, 
  SNTAssetType,
  BlockRequestRecord 
} from '../types/request';

export const DEPARTMENTS: Record<DepartmentCode, DepartmentInfo> = {
  ENGINEERING: {
    code: 'ENGINEERING',
    name: 'Engineering',
    shortName: 'ENG',
    systemCode: 'TMS',
    systemName: 'Track Management System',
    description: 'Track and engineering infrastructure maintenance, deep screening, rail replacements, and structural maintenance.',
    route: '/request/engineering'
  },
  TRD: {
    code: 'TRD',
    name: 'Traction Distribution (TRD)',
    shortName: 'TRD',
    systemCode: 'TDMS',
    systemName: 'Traction Distribution Management System',
    description: 'Overhead Equipment (OHE), traction substations, power supply isolations, mast alignments, and electrical maintenance.',
    route: '/request/trd'
  },
  SNT: {
    code: 'SNT',
    name: 'Signal & Telecommunication (S&T)',
    shortName: 'S&T',
    systemCode: 'SMMS',
    systemName: 'Signalling Maintenance & Management System',
    description: 'Electronic interlocking, point machines, track circuits, axle counters, optical fiber, and communication networks.',
    route: '/request/snt'
  }
};

export const CORRIDORS = [
  // Erode - Chennai Routes (Southern Railway)
  { 
    id: 'COR-SR-01', 
    name: 'Erode Jn - Chennai Central (ED-MAS) Main Line via Salem, Jolarpettai & Katpadi', 
    division: 'Salem / Chennai', 
    zone: 'Southern Railway (SR)' 
  },
  { 
    id: 'COR-SR-02', 
    name: 'Chennai Central - Erode Jn (MAS-ED) Main Line via Katpadi, Jolarpettai & Salem', 
    division: 'Chennai / Salem', 
    zone: 'Southern Railway (SR)' 
  },
  { 
    id: 'COR-SR-03', 
    name: 'Erode Jn - Salem Jn (ED-SA)', 
    division: 'Salem', 
    zone: 'Southern Railway (SR)' 
  },
  { 
    id: 'COR-SR-04', 
    name: 'Salem Jn - Jolarpettai Jn (SA-JTJ)', 
    division: 'Salem', 
    zone: 'Southern Railway (SR)' 
  },
  { 
    id: 'COR-SR-05', 
    name: 'Jolarpettai Jn - Katpadi Jn (JTJ-KPD)', 
    division: 'Chennai', 
    zone: 'Southern Railway (SR)' 
  },
  { 
    id: 'COR-SR-06', 
    name: 'Katpadi Jn - Arakkonam Jn (KPD-AJJ)', 
    division: 'Chennai', 
    zone: 'Southern Railway (SR)' 
  },
  { 
    id: 'COR-SR-07', 
    name: 'Arakkonam Jn - Chennai Central (AJJ-MAS)', 
    division: 'Chennai', 
    zone: 'Southern Railway (SR)' 
  },
  { 
    id: 'COR-SR-08', 
    name: 'Erode Jn - Chennai Egmore (ED-MS) via Salem, Attur & Vriddhachalam', 
    division: 'Salem / Tiruchirappalli / Chennai', 
    zone: 'Southern Railway (SR)' 
  },
  { 
    id: 'COR-SR-09', 
    name: 'Erode Jn - Chennai Egmore (ED-MS) via Karur, Tiruchirappalli & Villupuram', 
    division: 'Salem / Tiruchirappalli / Chennai', 
    zone: 'Southern Railway (SR)' 
  },
  // Other Trunk Corridors
  { 
    id: 'COR-01', 
    name: 'New Delhi - Kanpur Central (NDLS-CNB)', 
    division: 'Delhi / Prayagraj', 
    zone: 'Northern / North Central' 
  },
  { 
    id: 'COR-02', 
    name: 'Howrah - Kharagpur (HWH-KGP)', 
    division: 'Howrah / Kharagpur', 
    zone: 'Eastern / South Eastern' 
  },
  { 
    id: 'COR-03', 
    name: 'Mumbai CSMT - Kalyan Jn (CSMT-KYN)', 
    division: 'Mumbai', 
    zone: 'Central' 
  },
  { 
    id: 'COR-05', 
    name: 'Vadodara - Ahmedabad (BRC-ADI)', 
    division: 'Vadodara / Ahmedabad', 
    zone: 'Western' 
  }
];

// All intermediate stations from Erode to Chennai on the Main Line
const ERODE_TO_CHENNAI_CENTRAL_STATIONS = [
  'Erode Jn (ED)',
  'Cauvery (CV)',
  'Anangur (ANU)',
  'Sankari Durg (SGE)',
  'Mavelipalayam (MVPM)',
  'Magudanchavadi (MVG)',
  'Ariyanur (AYN)',
  'Virapandy Road (VRP)',
  'Neykkarappatti (NXP)',
  'Salem Jn (SA)',
  'Magnesite Jn (MAG)',
  'Karuppur (KPPR)',
  'Omalur Jn (OML)',
  'Semmandappatti (SMP)',
  'Deevattipatti (DVPT)',
  'Danishpet (DSPT)',
  'Lokur (LCR)',
  'Bommidi (BQI)',
  'Buddireddippatti (BDY)',
  'Morappur (MAP)',
  'Doddampatti (DPI)',
  'Dasampatti (DST)',
  'Samalpatti (SLY)',
  'Kunnathur (KNNT)',
  'Kagankarai (KEY)',
  'Tirupattur (TPT)',
  'Jolarpettai Jn (JTJ)',
  'Kettandapatti (KDT)',
  'Vaniyambadi (VN)',
  'Vinnamangalam (VNMG)',
  'Ambur (AB)',
  'Pachchakuppam (PCKM)',
  'Melpatti (MPI)',
  'Valathoor (MEH)',
  'Gudiyattam (GYM)',
  'Kavanur (KVN)',
  'Latteri (VT)',
  'Katpadi Jn (KPD)',
  'Sevur (SVUR)',
  'Tiruvalam (THV)',
  'Mukundarayapuram (MCN)',
  'Walajah Road Jn (WJR)',
  'Thalangai (THL)',
  'Sholinghur (SHU)',
  'Mahendravadi (MDVE)',
  'Anavardikhanpettai (AVN)',
  'Chitteri (CTRE)',
  'Melpakkam (MLPM)',
  'Arakkonam Jn (AJJ)',
  'Puliyamangalam (PLMG)',
  'Mosur (MSU)',
  'Thiruvalangadu (TO)',
  'Manavur (MAF)',
  'Senji Panambakkam (SPAM)',
  'Kadambattur (KBT)',
  'Egattur (EGT)',
  'Tiruvallur (TRL)',
  'Putlur (PUT)',
  'Sevvapet Road (SVR)',
  'Veppampattu (VEU)',
  'Tiruninravur (TI)',
  'Nemilichery (NEC)',
  'Pattabiram (PAB)',
  'Hindu College (HC)',
  'Avadi (AVD)',
  'Annanur (ANNR)',
  'Tirumullaivayil (TMVL)',
  'Ambattur (ABU)',
  'Pattaravakkam (PVM)',
  'Korattur (KOTR)',
  'Villivakkam (VLK)',
  'Perambur Locomotive Works (PEW)',
  'Perambur Carriage Works (PCW)',
  'Perambur (PER)',
  'Vyasarpadi Jeeva (VPY)',
  'Basin Bridge Jn (BBQ)',
  'Chennai Central (MAS)'
];

export const CORRIDOR_STATIONS: Record<string, string[]> = {
  'COR-SR-01': [...ERODE_TO_CHENNAI_CENTRAL_STATIONS],
  'COR-SR-02': [...ERODE_TO_CHENNAI_CENTRAL_STATIONS].reverse(),
  'COR-SR-03': [
    'Erode Jn (ED)',
    'Cauvery (CV)',
    'Anangur (ANU)',
    'Sankari Durg (SGE)',
    'Mavelipalayam (MVPM)',
    'Magudanchavadi (MVG)',
    'Ariyanur (AYN)',
    'Virapandy Road (VRP)',
    'Neykkarappatti (NXP)',
    'Salem Jn (SA)'
  ],
  'COR-SR-04': [
    'Salem Jn (SA)',
    'Magnesite Jn (MAG)',
    'Karuppur (KPPR)',
    'Omalur Jn (OML)',
    'Semmandappatti (SMP)',
    'Deevattipatti (DVPT)',
    'Danishpet (DSPT)',
    'Lokur (LCR)',
    'Bommidi (BQI)',
    'Buddireddippatti (BDY)',
    'Morappur (MAP)',
    'Doddampatti (DPI)',
    'Dasampatti (DST)',
    'Samalpatti (SLY)',
    'Kunnathur (KNNT)',
    'Kagankarai (KEY)',
    'Tirupattur (TPT)',
    'Jolarpettai Jn (JTJ)'
  ],
  'COR-SR-05': [
    'Jolarpettai Jn (JTJ)',
    'Kettandapatti (KDT)',
    'Vaniyambadi (VN)',
    'Vinnamangalam (VNMG)',
    'Ambur (AB)',
    'Pachchakuppam (PCKM)',
    'Melpatti (MPI)',
    'Valathoor (MEH)',
    'Gudiyattam (GYM)',
    'Kavanur (KVN)',
    'Latteri (VT)',
    'Katpadi Jn (KPD)'
  ],
  'COR-SR-06': [
    'Katpadi Jn (KPD)',
    'Sevur (SVUR)',
    'Tiruvalam (THV)',
    'Mukundarayapuram (MCN)',
    'Walajah Road Jn (WJR)',
    'Thalangai (THL)',
    'Sholinghur (SHU)',
    'Mahendravadi (MDVE)',
    'Anavardikhanpettai (AVN)',
    'Chitteri (CTRE)',
    'Melpakkam (MLPM)',
    'Arakkonam Jn (AJJ)'
  ],
  'COR-SR-07': [
    'Arakkonam Jn (AJJ)',
    'Puliyamangalam (PLMG)',
    'Mosur (MSU)',
    'Thiruvalangadu (TO)',
    'Manavur (MAF)',
    'Senji Panambakkam (SPAM)',
    'Kadambattur (KBT)',
    'Egattur (EGT)',
    'Tiruvallur (TRL)',
    'Putlur (PUT)',
    'Sevvapet Road (SVR)',
    'Veppampattu (VEU)',
    'Tiruninravur (TI)',
    'Nemilichery (NEC)',
    'Pattabiram (PAB)',
    'Hindu College (HC)',
    'Avadi (AVD)',
    'Annanur (ANNR)',
    'Tirumullaivayil (TMVL)',
    'Ambattur (ABU)',
    'Pattaravakkam (PVM)',
    'Korattur (KOTR)',
    'Villivakkam (VLK)',
    'Perambur Locomotive Works (PEW)',
    'Perambur Carriage Works (PCW)',
    'Perambur (PER)',
    'Vyasarpadi Jeeva (VPY)',
    'Basin Bridge Jn (BBQ)',
    'Chennai Central (MAS)'
  ],
  'COR-SR-08': [
    'Erode Jn (ED)',
    'Cauvery (CV)',
    'Anangur (ANU)',
    'Sankari Durg (SGE)',
    'Magudanchavadi (MVG)',
    'Virapandy Road (VRP)',
    'Salem Jn (SA)',
    'Salem Market (SAMT)',
    'Salem Town (SXT)',
    'Ayodhyapattanam (APN)',
    'Minnampalli (MPLI)',
    'Valappadi Gate (VXM)',
    'Ettapur Road (ETP)',
    'Belur (BLR)',
    'Pedanayakanpalayam (PDKM)',
    'Attur (ATU)',
    'Talaivasal (TVS)',
    'Chinna Salem (CHSM)',
    'Melnariyapanur (MLYR)',
    'Siruvattur (SRVT)',
    'Pukiravari (PRV)',
    'Vriddhachalam Jn (VRI)',
    'Ulundurpet (ULU)',
    'Parikkal (PRKL)',
    'Tiruvennainallur (TVNL)',
    'Villupuram Jn (VM)',
    'Vikravandi (VVN)',
    'Mailam (MYP)',
    'Tindivanam (TMV)',
    'Olakur (OLA)',
    'Tozhuppedu (TZD)',
    'Acharapakkam (ACK)',
    'Melmaruvathur (MLMR)',
    'Madurantakam (MMK)',
    'Karunguzhi (KGZ)',
    'Chengalpattu Jn (CGL)',
    'Paranur (PWU)',
    'Singaperumal Koil (SKL)',
    'Maraimalai Nagar (MMNK)',
    'Kattangulattur (CTM)',
    'Potheri (POTI)',
    'Guduvancheri (GI)',
    'Vandalur (VDR)',
    'Perungalathur (PRGL)',
    'Tambaram (TBM)',
    'Sanatorium (TBMS)',
    'Chromepet (CMP)',
    'Pallavaram (PV)',
    'Tirusulam (TLM)',
    'Minambakkam (MN)',
    'Guindy (GDY)',
    'Saidapet (SP)',
    'Mambalam (MBM)',
    'Kodambakkam (KOT)',
    'Nungambakkam (NBK)',
    'Chetpet (MSC)',
    'Chennai Egmore (MS)'
  ],
  'COR-SR-09': [
    'Erode Jn (ED)',
    'Chigalur (CGE)',
    'Pasur (PAS)',
    'Unjalur (URL)',
    'Kodumudi (KMD)',
    'Noyal (NOY)',
    'Pugalur (PGR)',
    'Murthipalayam (MPLM)',
    'Karur Jn (KRR)',
    'Virarakkiyam (VRQ)',
    'Mayanoor (MYU)',
    'Mahadanapuram (MMH)',
    'Lalapet (LP)',
    'Timmachipuram (TNR)',
    'Kulitalai (KLT)',
    'Marudur (MUQ)',
    'Pettavaithalai (PLI)',
    'Perugamani (PGN)',
    'Elamanur (EL)',
    'Jeeyapuram (JPM)',
    'Muttarasanallur (MTNL)',
    'Tiruchirappalli Fort (TP)',
    'Tiruchirappalli Palakkarai (TPE)',
    'Tiruchirappalli Jn (TPJ)',
    'Golden Rock / Ponmalai (GOC)',
    'Tiruchirappalli Town (TPTN)',
    'Srirangam (SRGM)',
    'Uttamarkovil (UKV)',
    'Pichchandarkovil (BXS)',
    'Valadi (VAL)',
    'Lalgudi (LLI)',
    'Kattur (KTTR)',
    'Pullambadi (PMB)',
    'Kallakkudi Palanganatham (KKPM)',
    'Kallagam (KLGM)',
    'Ariyalur (ALU)',
    'Sendurai (SNU)',
    'Mathur (MTUR)',
    'Pennadam (PNDM)',
    'Vriddhachalam Jn (VRI)',
    'Ulundurpet (ULU)',
    'Villupuram Jn (VM)',
    'Tindivanam (TMV)',
    'Melmaruvathur (MLMR)',
    'Madurantakam (MMK)',
    'Chengalpattu Jn (CGL)',
    'Tambaram (TBM)',
    'Mambalam (MBM)',
    'Chennai Egmore (MS)'
  ],
  'COR-01': ['New Delhi (NDLS)', 'Ghaziabad (GZB)', 'Aligarh (ALJN)', 'Tundla (TDL)', 'Etawah (ETW)', 'Kanpur Central (CNB)'],
  'COR-02': ['Howrah (HWH)', 'Santragachi (SRC)', 'Uluberia (ULB)', 'Mecheda (MCA)', 'Panskura (PKU)', 'Kharagpur (KGP)'],
  'COR-03': ['Mumbai CSMT (CSMT)', 'Dadar (DR)', 'Kurla (CLA)', 'Thane (TNA)', 'Diva Jn (DIVA)', 'Kalyan Jn (KYN)'],
  'COR-05': ['Vadodara (BRC)', 'Anand (ANND)', 'Nadiad (ND)', 'Mahemdavad (MHD)', 'Maninagar (MAN)', 'Ahmedabad (ADI)']
};

export const TRACK_LINES: { value: TrackLineType; label: string }[] = [
  { value: 'UP', label: 'UP Main Line' },
  { value: 'DOWN', label: 'DOWN Main Line' },
  { value: 'SINGLE', label: 'Single Line' },
  { value: '3RD_LINE', label: '3rd Line' },
  { value: '4TH_LINE', label: '4th Line' },
  { value: 'YARD_LINE', label: 'Yard / Loop Line' }
];

export const PRIORITIES: { value: PriorityLevel; label: string; description: string; badgeClass: string }[] = [
  { value: 'NORMAL', label: 'Normal Priority', description: 'Standard planned cyclic maintenance (7+ days notice)', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' },
  { value: 'URGENT', label: 'Urgent Priority', description: 'Imminent maintenance to prevent speed restriction (48-72h)', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' },
  { value: 'EMERGENCY', label: 'Emergency Priority', description: 'Immediate safety or track integrity hazard (Immediate/Within 24h)', badgeClass: 'bg-red-100 text-red-900 border-red-300' }
];

export const URGENCIES: { value: UrgencyLevel; label: string }[] = [
  { value: 'ROUTINE', label: 'Routine Planned Block' },
  { value: 'PLANNED_WEEKLY', label: 'Weekly Corridor Maintenance' },
  { value: 'CRITICAL_SAFETY', label: 'Critical Safety / Integrity Intervention' }
];

export const STATUS_CONFIG: Record<RequestStatus, { label: string; bg: string; text: string; border: string }> = {
  DRAFT: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  SUBMITTED: { label: 'Submitted', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
  UNDER_PLANNING: { label: 'Under Planning', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  APPROVED: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
  REJECTED: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' },
  COMPLETED: { label: 'Completed', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' }
};

// Engineering Assets & Maintenance
export const ENGINEERING_ASSET_TYPES: EngineeringAssetType[] = [
  'Track',
  'Rail',
  'Sleeper',
  'Point / Turnout',
  'Bridge',
  'Other Engineering Asset'
];

export const ENGINEERING_MAINTENANCE_TYPES = [
  'Deep Screening by BCM',
  'Plain Track Tamping (CSM / Duomatic)',
  'Turnout Tamping (UNIMAT)',
  'Rail Grinding (RGM)',
  'Through Rail Renewal (TRR)',
  'Through Sleeper Renewal (TSR)',
  'Turnout Renewal (TWS/CMS Crossing)',
  'Ballast Regulation & Profiling (BRM)',
  'Track Stabilization (DGS)',
  'Bridge Girder Inspection & Painting',
  'Track Circuit Insulation Joint Renewal',
  'Destressing of LWR/CWR Track'
];

export const ENGINEERING_MACHINERY = [
  'Ballast Cleaning Machine (BCM)',
  'Continuous Tamping Machine (CSM)',
  'Points & Crossing Tamper (UNIMAT)',
  'Dynamic Track Stabilizer (DGS)',
  'Ballast Regulating Machine (BRM)',
  'Track Relaying Train (TRT)',
  'Rail Grinding Machine (RGM)',
  'Portal Crane / Dip Lorry',
  'Manual P-Way Gang / Trackmen'
];

// TRD Assets & Maintenance
export const TRD_ASSET_TYPES: TRDAssetType[] = [
  'OHE',
  'Mast',
  'Insulator',
  'Section Insulator',
  'Switch',
  'Traction Equipment',
  'Other TRD Asset'
];

export const TRD_MAINTENANCE_TYPES = [
  'Annual Maintenance of OHE (AOH)',
  'Periodic Overhaul of OHE (POH)',
  'Bracket Adjustment & Cantilever Overhaul',
  'Section Insulator Overhaul & Testing',
  'Isolator & Interrupter Servicing',
  'Hotline / Coldline Insulator Washing',
  'Dropper & Jumper Renewal',
  'Contact Wire Wear Measurement & Stagger Adjustment',
  'Neutral Section Inspection & Gap Checking',
  'Traction Substation (TSS) Feeder Maintenance',
  'OHE Height & Stagger Checking by Tower Wagon'
];

export const TRD_EQUIPMENT = [
  '8-Wheeler Tower Wagon (DETC)',
  '4-Wheeler Tower Wagon',
  'OHE Ladder Trolley',
  'Traction Discharge Rods (Earthing set)',
  'Contact Wire Tension Gauge',
  'Thermal Imaging Camera',
  'Megger / Insulation Resistance Tester',
  'Torque Wrenches & Cable Pullers'
];

// S&T Assets & Maintenance
export const SNT_ASSET_TYPES: SNTAssetType[] = [
  'Signal',
  'Track Circuit',
  'Axle Counter',
  'Interlocking Equipment',
  'Point Machine',
  'Telecom Equipment',
  'Other S&T Asset'
];

export const SNT_MAINTENANCE_TYPES = [
  'Electronic Interlocking (EI) Diagnostic & Card Testing',
  'Point Machine (IRS/Siemens) Overhauling & Obstruction Test',
  'Track Circuit Parameter Checking & Bonding Overhaul',
  'Digital Axle Counter (MSDAC/HASSDAC) Tuning',
  'Signal Aspect LED Unit Replacement & Alignment',
  'Signalling Power Supply / IPS Battery Bank Testing',
  'Block Instrument Routine Overhaul & Bell Testing',
  'Underground Signalling Cable Insulation Testing',
  'OFC / SDH Equipment System Health Checking',
  'Level Crossing Interlocking Gate Gear Maintenance'
];

export const SNT_EQUIPMENT = [
  'Digital Multimeter & Clamp Meter',
  'Insulation Tester (500V/1000V Megger)',
  'High-Frequency Cable Fault Locator',
  'Point Machine Obstruction Test Gauge (3.8mm & 5mm)',
  'Signal Aspect Lux Meter',
  'Track Feed Battery Charger & Hydrometer',
  'Optical Time Domain Reflectometer (OTDR)',
  'Fail-Safe Microprocessor Tester'
];

export const COMMON_SAFETY_REQUIREMENTS = [
  'Caution Order to be issued to Loco Pilots (TSR/PSR)',
  'Protection of work site with Banner Flags & Detonators',
  'Competent Lookout Men with Hooter / Red Hand Flag',
  'Personal Protective Equipment (Helmet, High-Vis Vest, Boots)',
  'Communication link maintained with Section Controller (SCOR)',
  'Site Supervisor (SSE/JE) presence mandatory throughout block',
  'Disconnection Memo (Form S&T-T/351) served to Station Master'
];

// Block requests store initialized empty for dynamic data
export const MOCK_REQUESTS: BlockRequestRecord[] = [];

