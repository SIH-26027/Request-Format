import { 
  EngineeringRequestFormData, 
  TRDRequestFormData, 
  SNTRequestFormData, 
  FormValidationErrors 
} from '../types/request';

/**
 * Validates Base Request Fields (Section A, B, D, E common, F)
 */
export function validateCommonRequest(
  data: EngineeringRequestFormData | TRDRequestFormData | SNTRequestFormData
): FormValidationErrors {
  const errors: FormValidationErrors = {};

  // Section A: Request Information
  if (!data.requestedBy || data.requestedBy.trim().length < 3) {
    errors.requestedBy = 'Official name of requesting authority is required (min 3 characters).';
  }
  if (!data.designation || data.designation.trim().length === 0) {
    errors.designation = 'Official designation is required (e.g., SSE / P-Way).';
  }
  if (!data.contactNumber || !/^[+]?[0-9\s-]{10,15}$/.test(data.contactNumber.trim())) {
    errors.contactNumber = 'Enter a valid 10-digit railway CUG or mobile number.';
  }
  if (!data.priority) {
    errors.priority = 'Please select a request priority level.';
  }
  if (!data.urgency) {
    errors.urgency = 'Please select urgency classification.';
  }

  // Section B: Location & Corridor
  if (!data.corridor) {
    errors.corridor = 'Corridor selection is mandatory.';
  }
  if (!data.fromLocation) {
    errors.fromLocation = 'From Station / Location is mandatory.';
  }
  if (!data.toLocation) {
    errors.toLocation = 'To Station / Location is mandatory.';
  }
  if (!data.blockSection || data.blockSection.trim().length === 0) {
    errors.blockSection = 'Block section name is mandatory.';
  }
  if (!data.line) {
    errors.line = 'Track line identifier is mandatory.';
  }
  if (!data.kilometerStart || data.kilometerStart.trim().length === 0) {
    errors.kilometerStart = 'Starting kilometer / chainage is required (e.g. 1314/12).';
  }

  // Section D: Maintenance Details
  if (!data.maintenanceType) {
    errors.maintenanceType = 'Maintenance work type must be selected.';
  }
  if (!data.description || data.description.trim().length < 15) {
    errors.description = 'Detailed scope description is required (min 15 characters).';
  }
  const totalMinutes = (Number(data.durationHours) || 0) * 60 + (Number(data.durationMinutes) || 0);
  if (totalMinutes <= 0) {
    errors.duration = 'Required block duration must be greater than 0 minutes.';
  }
  if (!data.preferredDate) {
    errors.preferredDate = 'Preferred block date is mandatory.';
  }
  if (!data.preferredStartTime) {
    errors.preferredStartTime = 'Preferred start time is required.';
  }
  if (!data.preferredEndTime) {
    errors.preferredEndTime = 'Preferred end time is required.';
  }

  // Section E: Team Size
  if (!data.maintenanceTeamSize || Number(data.maintenanceTeamSize) <= 0) {
    errors.maintenanceTeamSize = 'Maintenance gang / team size must be at least 1 person.';
  }

  // Section F: Safety Requirements
  if (!data.safetyRequirements || data.safetyRequirements.length === 0) {
    errors.safetyRequirements = 'At least one standard railway safety protocol must be selected.';
  }

  return errors;
}

/**
 * Validates Engineering (TMS) Request Form
 */
export function validateEngineeringRequest(data: EngineeringRequestFormData): FormValidationErrors {
  const errors = validateCommonRequest(data);

  // Section C: Engineering Asset
  if (!data.assetType) {
    errors.assetType = 'Engineering asset category must be selected.';
  }
  if (!data.assetId || data.assetId.trim().length === 0) {
    errors.assetId = 'Asset ID / Point / Track segment reference is required.';
  }
  if (!data.assetCondition) {
    errors.assetCondition = 'Asset condition assessment is mandatory.';
  }
  if (!data.defectReason || data.defectReason.trim().length < 10) {
    errors.defectReason = 'Defect reason or maintenance justification is required (min 10 chars).';
  }

  // Section E: Speed restriction logic
  if (data.speedRestrictionRequired && (!data.speedRestrictionValue || Number(data.speedRestrictionValue) <= 0)) {
    errors.speedRestrictionValue = 'Specify the Temporary Speed Restriction (TSR in kmph).';
  }

  return errors;
}

/**
 * Validates Traction Distribution (TRD / TDMS) Request Form
 */
export function validateTRDRequest(data: TRDRequestFormData): FormValidationErrors {
  const errors = validateCommonRequest(data);

  // Section C: TRD Asset
  if (!data.assetType) {
    errors.assetType = 'TRD / OHE asset category must be selected.';
  }
  if (!data.assetId || data.assetId.trim().length === 0) {
    errors.assetId = 'Traction asset / Mast / Isolator ID is required.';
  }
  if (!data.oheSection || data.oheSection.trim().length === 0) {
    errors.oheSection = 'Elementary OHE section code is required (e.g. SEC-04 / 102-1).';
  }
  if (!data.defectReason || data.defectReason.trim().length < 10) {
    errors.defectReason = 'Traction defect or overhaul justification is required (min 10 chars).';
  }

  // Section E: Electrical Safety
  if (data.powerShutdownRequired && !data.earthingRequired) {
    errors.earthingRequired = 'Earthing (discharge rods at both ends) is mandatory when 25kV power shutdown is requested.';
  }

  return errors;
}

/**
 * Validates Signal & Telecommunication (S&T / SMMS) Request Form
 */
export function validateSNTRequest(data: SNTRequestFormData): FormValidationErrors {
  const errors = validateCommonRequest(data);

  // Section C: S&T Asset
  if (!data.assetType) {
    errors.assetType = 'Signalling or Telecom asset type must be selected.';
  }
  if (!data.assetId || data.assetId.trim().length === 0) {
    errors.assetId = 'Signal Gear / Point Machine / Track Circuit ID is required.';
  }
  if (!data.equipmentCategory || data.equipmentCategory.trim().length === 0) {
    errors.equipmentCategory = 'Equipment category / make is required.';
  }
  if (!data.defectReason || data.defectReason.trim().length < 10) {
    errors.defectReason = 'Signalling fault or maintenance justification is required (min 10 chars).';
  }

  // Section E: Disconnection Memo Requirement
  if (data.disconnectionRequired && !data.safetyRequirements.some(s => s.toLowerCase().includes('disconnection memo'))) {
    errors.safetyRequirements = 'Serving Disconnection Memo (Form S&T-T/351) to Station Master must be checked in Safety Requirements.';
  }

  return errors;
}
