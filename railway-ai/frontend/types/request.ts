/**
 * Railway Automatic Block Planning System
 * Block Request Module Types
 */

export type DepartmentCode = 'ENGINEERING' | 'TRD' | 'SNT';

export interface DepartmentInfo {
  code: DepartmentCode;
  name: string;
  shortName: string;
  systemCode: string;
  systemName: string;
  description: string;
  route: string;
}

export type PriorityLevel = 'NORMAL' | 'URGENT' | 'EMERGENCY';

export type UrgencyLevel = 'ROUTINE' | 'PLANNED_WEEKLY' | 'CRITICAL_SAFETY';

export type RequestStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER_PLANNING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'COMPLETED';

export type TrackLineType = 'UP' | 'DOWN' | 'SINGLE' | '3RD_LINE' | '4TH_LINE' | 'YARD_LINE';

// Engineering Asset Types
export type EngineeringAssetType = 
  | 'Track'
  | 'Rail'
  | 'Sleeper'
  | 'Point / Turnout'
  | 'Bridge'
  | 'Other Engineering Asset';

// TRD Asset Types
export type TRDAssetType = 
  | 'OHE'
  | 'Mast'
  | 'Insulator'
  | 'Section Insulator'
  | 'Switch'
  | 'Traction Equipment'
  | 'Other TRD Asset';

// S&T Asset Types
export type SNTAssetType = 
  | 'Signal'
  | 'Track Circuit'
  | 'Axle Counter'
  | 'Interlocking Equipment'
  | 'Point Machine'
  | 'Telecom Equipment'
  | 'Other S&T Asset';

export type AllAssetTypes = EngineeringAssetType | TRDAssetType | SNTAssetType;

// Base Request Information
export interface BaseRequestFormData {
  // A. Request Information
  requestId: string;
  requestDate: string;
  requestedBy: string;
  designation: string;
  contactNumber: string;
  priority: PriorityLevel;
  urgency: UrgencyLevel;

  // B. Location & Corridor
  corridor: string;
  fromLocation: string;
  toLocation: string;
  blockSection: string;
  line: TrackLineType;
  kilometerStart: string;
  kilometerEnd: string;

  // D. Maintenance Details
  maintenanceType: string;
  description: string;
  durationHours: number;
  durationMinutes: number;
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime: string;

  // F. Additional Information
  safetyRequirements: string[];
  remarks: string;
}

// Engineering Specific Form Data
export interface EngineeringRequestFormData extends BaseRequestFormData {
  department: 'ENGINEERING';
  // C. Asset Information
  assetType: EngineeringAssetType;
  assetId: string;
  assetCondition: 'GOOD' | 'FAIR' | 'CRITICAL' | 'SEVERE_WEAR';
  defectReason: string;

  // E. Operational Requirements
  blockRequired: boolean;
  disconnectionRequired: boolean;
  trafficRestrictionRequired: boolean;
  speedRestrictionRequired: boolean;
  speedRestrictionValue?: number; // kmph
  machineryRequired: string[];
  maintenanceTeamSize: number;
}

// TRD Specific Form Data
export interface TRDRequestFormData extends BaseRequestFormData {
  department: 'TRD';
  // C. Traction Asset Information
  assetType: TRDAssetType;
  assetId: string;
  oheSection: string;
  equipmentType: string;
  defectReason: string;

  // E. Electrical / Traction Requirements
  disconnectionRequired: boolean;
  isolationRequired: boolean;
  powerShutdownRequired: boolean;
  earthingRequired: boolean;
  requiredEquipment: string[];
  maintenanceTeamSize: number;
}

// S&T Specific Form Data
export interface SNTRequestFormData extends BaseRequestFormData {
  department: 'SNT';
  // C. S&T Asset Information
  assetType: SNTAssetType;
  assetId: string;
  equipmentCategory: string;
  defectReason: string;

  // E. Operational Requirements
  blockRequired: boolean;
  disconnectionRequired: boolean;
  signallingIsolationRequired: boolean;
  communicationRestrictionRequired: boolean;
  requiredEquipment: string[];
  maintenanceTeamSize: number;
}

export type BlockRequestFormData = 
  | EngineeringRequestFormData 
  | TRDRequestFormData 
  | SNTRequestFormData;

// Full Request Record (Used in list, details, and timeline)
export interface BlockRequestRecord {
  id: string;
  requestId?: string;
  displayStatus?: string;
  department: DepartmentCode;
  departmentName: string;
  systemName: string; // TMS, TDMS, SMMS
  status: RequestStatus;
  priority: PriorityLevel;
  urgency: UrgencyLevel;
  corridor: string;
  blockSection: string;
  fromStation?: string;
  toStation?: string;
  trackLine?: string;
  trackType?: string;
  sectionSpeed?: number;
  chainageStart?: number;
  chainageEnd?: number;
  assetName?: string;
  fromLocation?: string;
  toLocation?: string;
  line?: TrackLineType;
  chainage: string;
  assetType: string;
  assetId: string;
  assetCondition?: string;
  defectReason: string;
  maintenanceType: string;
  description: string;
  requestedDate: string;
  preferredDate: string;
  preferredStartTime: string;
  preferredEndTime: string;
  durationFormatted: string;
  durationMinutesTotal: number;
  requestedBy: string;
  designation: string;
  contactNumber: string;
  operationalRequirements: {
    label: string;
    value: boolean | string | string[] | number;
  }[];
  equipmentRequired: string[];
  teamSize: number;
  safetyRequirements: string[];
  remarks: string;
  timeline: {
    status: RequestStatus;
    label: string;
    timestamp?: string;
    officer?: string;
    note?: string;
    isCompleted: boolean;
    isCurrent: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Form validation errors map
export type FormValidationErrors = Record<string, string>;

// Filter state for /requests table
export interface RequestFilterState {
  search: string;
  department: 'ALL' | DepartmentCode;
  status: 'ALL' | RequestStatus;
  priority: 'ALL' | PriorityLevel;
  corridor: string;
  date: string;
}
