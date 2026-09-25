'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RequestHeader from '../../../components/request/common/RequestHeader';
import RequestSection from '../../../components/request/common/RequestSection';
import FormField from '../../../components/request/common/FormField';
import TextInput from '../../../components/request/common/TextInput';
import SelectInput from '../../../components/request/common/SelectInput';
import DateInput from '../../../components/request/common/DateInput';
import TimeInput from '../../../components/request/common/TimeInput';
import Textarea from '../../../components/request/common/Textarea';
import Checkbox from '../../../components/request/common/Checkbox';
import PrioritySelector from '../../../components/request/common/PrioritySelector';
import CorridorSelector from '../../../components/request/common/CorridorSelector';
import FormActions from '../../../components/request/common/FormActions';
import FormValidationAlert from '../../../components/request/common/FormValidationAlert';
import RequestSummary from '../../../components/request/common/RequestSummary';
import EngineeringAssetFields from '../../../components/request/engineering/EngineeringAssetFields';
import EngineeringMaintenanceFields from '../../../components/request/engineering/EngineeringMaintenanceFields';

import { 
  EngineeringRequestFormData, 
  FormValidationErrors, 
  BlockRequestRecord 
} from '../../../types/request';
import { 
  URGENCIES, 
  ENGINEERING_MAINTENANCE_TYPES, 
  COMMON_SAFETY_REQUIREMENTS 
} from '../../../constants/request.constants';
import { 
  generateRequestId, 
  getTodayDateString, 
  getTomorrowDateString,
  calculateDurationFromTimes,
  formatDuration 
} from '../../../utils/request.utils';
import { validateEngineeringRequest } from '../../../validations/request.validation';
import { RequestService } from '../../../services/request.service';

export default function EngineeringRequestPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<EngineeringRequestFormData>({
    department: 'ENGINEERING',
    requestId: '',
    requestDate: getTodayDateString(),
    requestedBy: '',
    designation: '',
    contactNumber: '',
    priority: 'NORMAL',
    urgency: 'ROUTINE',
    corridor: '',
    fromLocation: '',
    toLocation: '',
    blockSection: '',
    line: 'UP',
    kilometerStart: '',
    kilometerEnd: '',
    assetType: 'Track',
    assetId: '',
    assetCondition: 'GOOD',
    defectReason: '',
    maintenanceType: '',
    description: '',
    durationHours: 2,
    durationMinutes: 0,
    preferredDate: getTomorrowDateString(),
    preferredStartTime: '',
    preferredEndTime: '',
    blockRequired: true,
    disconnectionRequired: false,
    trafficRestrictionRequired: false,
    speedRestrictionRequired: false,
    speedRestrictionValue: 0,
    machineryRequired: [],
    maintenanceTeamSize: 1,
    safetyRequirements: [],
    remarks: ''
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Prefetch target routes for instantaneous navigation
    router.prefetch('/request/submitted');
    router.prefetch('/requests');

    // Generate official ID if empty
    if (!formData.requestId) {
      setFormData((prev: EngineeringRequestFormData) => ({
        ...prev,
        requestId: generateRequestId('ENGINEERING')
      }));
    }
    // Check if draft exists
    const savedDraft = RequestService.getDraft<EngineeringRequestFormData>('ENGINEERING');
    if (savedDraft) {
      setFormData(savedDraft);
      setDraftSaved(true);
    }
  }, [router]);

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev: EngineeringRequestFormData) => {
      const updated = { ...prev, [field]: value };

      // Auto calculate duration if start and end times are updated
      if (field === 'preferredStartTime' || field === 'preferredEndTime') {
        const start = field === 'preferredStartTime' ? (value as string) : prev.preferredStartTime;
        const end = field === 'preferredEndTime' ? (value as string) : prev.preferredEndTime;
        const dur = calculateDurationFromTimes(start, end);
        if (dur.hours > 0 || dur.minutes > 0) {
          updated.durationHours = dur.hours;
          updated.durationMinutes = dur.minutes;
        }
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev: FormValidationErrors) => {
        const clone = { ...prev };
        delete clone[field];
        return clone;
      });
    }
  };

  const handleSafetyToggle = (safety: string) => {
    setFormData((prev: EngineeringRequestFormData) => {
      const exists = prev.safetyRequirements.includes(safety);
      const nextReqs = exists
        ? prev.safetyRequirements.filter((s: string) => s !== safety)
        : [...prev.safetyRequirements, safety];
      return { ...prev, safetyRequirements: nextReqs };
    });
    if (errors.safetyRequirements) {
      setErrors((prev: FormValidationErrors) => {
        const clone = { ...prev };
        delete clone.safetyRequirements;
        return clone;
      });
    }
  };

  const handleSaveDraft = () => {
    RequestService.saveDraft('ENGINEERING', formData);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 4000);
  };

  const handleSubmit = () => {
    setSubmitError(null);
    const validationErrors = validateEngineeringRequest(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowConfirmModal(false);
      // Smoothly scroll to warning banner
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // All fields are valid -> open confirmation modal
    setErrors({});
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Prepare complete record
    const totalMins = Number(formData.durationHours) * 60 + Number(formData.durationMinutes);
    const newRecord: BlockRequestRecord = {
      id: formData.requestId,
      department: 'ENGINEERING',
      departmentName: 'Engineering',
      systemName: 'TMS',
      status: 'SUBMITTED',
      priority: formData.priority,
      urgency: formData.urgency,
      corridor: formData.corridor,
      blockSection: formData.blockSection,
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      line: formData.line,
      chainage: `Km ${formData.kilometerStart} to ${formData.kilometerEnd}`,
      assetType: formData.assetType,
      assetId: formData.assetId,
      assetCondition: formData.assetCondition,
      defectReason: formData.defectReason,
      maintenanceType: formData.maintenanceType,
      description: formData.description,
      requestedDate: formData.requestDate,
      preferredDate: formData.preferredDate,
      preferredStartTime: formData.preferredStartTime,
      preferredEndTime: formData.preferredEndTime,
      durationFormatted: formatDuration(formData.durationHours, formData.durationMinutes),
      durationMinutesTotal: totalMins,
      requestedBy: formData.requestedBy,
      designation: formData.designation,
      contactNumber: formData.contactNumber,
      operationalRequirements: [
        { label: 'Traffic Block Required', value: formData.blockRequired },
        { label: 'S&T Disconnection Required', value: formData.disconnectionRequired },
        { label: 'Adjacent Line Restriction', value: formData.trafficRestrictionRequired },
        { label: 'Post-Block Speed Restriction (TSR)', value: formData.speedRestrictionRequired ? `${formData.speedRestrictionValue} kmph` : 'None' }
      ],
      equipmentRequired: formData.machineryRequired,
      teamSize: formData.maintenanceTeamSize,
      safetyRequirements: formData.safetyRequirements,
      remarks: formData.remarks,
      timeline: [
        {
          status: 'DRAFT',
          label: 'Draft Created',
          timestamp: `${formData.requestDate} 08:30`,
          officer: `${formData.requestedBy} (${formData.designation})`,
          isCompleted: true,
          isCurrent: false
        },
        {
          status: 'SUBMITTED',
          label: 'Submitted to Division Block Cell',
          timestamp: `${formData.requestDate} 09:15`,
          officer: `${formData.requestedBy} (${formData.designation})`,
          note: 'Formally queued for corridor slot simulation and conflict detection.',
          isCompleted: true,
          isCurrent: true
        },
        {
          status: 'UNDER_PLANNING',
          label: 'Corridor Slot Scheduling',
          isCompleted: false,
          isCurrent: false
        },
        {
          status: 'APPROVED',
          label: 'Block Sanctioned by Sr.DOM',
          isCompleted: false,
          isCurrent: false
        },
        {
          status: 'COMPLETED',
          label: 'Block Completion & Safety Clearance',
          isCompleted: false,
          isCurrent: false
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await RequestService.save(newRecord);
      RequestService.clearDraft('ENGINEERING');
      setShowConfirmModal(false);
      setIsSubmitting(false);
      setSubmitSuccess(newRecord.id);
      router.push(`/request/submitted?id=${formData.requestId}&dept=ENGINEERING`);
    } catch (err: any) {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setSubmitError(err?.message || 'Database error: The request was not submitted. Please verify connection and try again.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <RequestHeader
        title="Engineering Block Request"
        subtitle="Submit a maintenance block request for track and engineering infrastructure."
        department="ENGINEERING"
        systemName="TMS"
        backLink="/request"
        backText="Back to Department Selection"
        breadcrumbs={[
          { label: 'Block Portal', href: '/request' },
          { label: 'Engineering (TMS)' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form Body */}
        <div className="lg:col-span-8 space-y-6">
          {/* Submission and Validation Status Alert */}
          <FormValidationAlert
            errors={errors}
            submitError={submitError}
            submitSuccess={submitSuccess}
            onClearErrors={() => setErrors({})}
          />

          {/* SECTION A: Request Information */}
          <RequestSection
            sectionLetter="A"
            title="Request Information"
            description="Authorizing officer credentials, identification code, and priority rating."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Block Request Reference ID"
                  id="requestId"
                  hint="Official auto-generated indent reference"
                >
                  <TextInput
                    id="requestId"
                    value={formData.requestId}
                    readOnly
                    className="font-mono bg-slate-100 text-blue-900 font-bold"
                  />
                </FormField>

                <FormField
                  label="Date of Request Submission"
                  id="requestDate"
                  required
                >
                  <DateInput
                    id="requestDate"
                    value={formData.requestDate}
                    onChange={(e) => handleFieldChange('requestDate', e.target.value)}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Requested By (Official Name)"
                  id="requestedBy"
                  required
                  error={errors.requestedBy}
                >
                  <TextInput
                    id="requestedBy"
                    value={formData.requestedBy}
                    placeholder="Full name of Section Engineer"
                    onChange={(e) => handleFieldChange('requestedBy', e.target.value)}
                    error={!!errors.requestedBy}
                  />
                </FormField>

                <FormField
                  label="Designation / Unit"
                  id="designation"
                  required
                  error={errors.designation}
                >
                  <TextInput
                    id="designation"
                    value={formData.designation}
                    placeholder="e.g. SSE / P-Way / ALJN"
                    onChange={(e) => handleFieldChange('designation', e.target.value)}
                    error={!!errors.designation}
                  />
                </FormField>

                <FormField
                  label="Contact Mobile / Railway CUG"
                  id="contactNumber"
                  required
                  error={errors.contactNumber}
                >
                  <TextInput
                    id="contactNumber"
                    value={formData.contactNumber}
                    placeholder="+91 94530 81204"
                    onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                    error={!!errors.contactNumber}
                  />
                </FormField>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Request Priority Rating <span className="text-red-600 font-bold">*</span>
                </label>
                <PrioritySelector
                  value={formData.priority}
                  onChange={(p) => handleFieldChange('priority', p)}
                  error={errors.priority}
                />
              </div>

              {/* Urgency */}
              <FormField
                label="Urgency Classification"
                id="urgency"
                required
                error={errors.urgency}
              >
                <SelectInput
                  id="urgency"
                  value={formData.urgency}
                  options={URGENCIES.map((u) => ({ value: u.value, label: u.label }))}
                  onChange={(e) => handleFieldChange('urgency', e.target.value)}
                  error={!!errors.urgency}
                />
              </FormField>
            </div>
          </RequestSection>

          {/* SECTION B: Location & Corridor */}
          <RequestSection
            sectionLetter="B"
            title="Location & Corridor"
            description="Specific railway corridor, section boundaries, track line, and chainage bounds."
          >
            <CorridorSelector
              corridor={formData.corridor}
              fromLocation={formData.fromLocation}
              toLocation={formData.toLocation}
              blockSection={formData.blockSection}
              line={formData.line}
              kilometerStart={formData.kilometerStart}
              kilometerEnd={formData.kilometerEnd}
              onChange={handleFieldChange}
              errors={errors}
            />
          </RequestSection>

          {/* SECTION C: Asset Information */}
          <RequestSection
            sectionLetter="C"
            title="Track & Engineering Asset Information"
            description="TMS asset classification, condition grading, and observed defect details."
          >
            <EngineeringAssetFields
              assetType={formData.assetType}
              assetId={formData.assetId}
              assetCondition={formData.assetCondition}
              defectReason={formData.defectReason}
              onChange={handleFieldChange}
              errors={errors}
            />
          </RequestSection>

          {/* SECTION D: Maintenance Details */}
          <RequestSection
            sectionLetter="D"
            title="Maintenance Work Details"
            description="Nature of engineering work, duration, and preferred operating window."
          >
            <div className="space-y-4">
              <FormField
                label="Maintenance Work Classification"
                id="maintenanceType"
                required
                error={errors.maintenanceType}
              >
                <SelectInput
                  id="maintenanceType"
                  value={formData.maintenanceType}
                  placeholder="-- Select P-Way Maintenance Activity --"
                  options={ENGINEERING_MAINTENANCE_TYPES.map((t) => ({ value: t, label: t }))}
                  onChange={(e) => handleFieldChange('maintenanceType', e.target.value)}
                  error={!!errors.maintenanceType}
                />
              </FormField>

              <FormField
                label="Detailed Scope of Work"
                id="description"
                required
                hint="Step-by-step description of track operation and site preparation"
                error={errors.description}
              >
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  placeholder="State work plan: e.g. Tamping of 1 in 12 turnout with UNIMAT machine, pre-tamping lifting & lining, consolidation by DGS..."
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  error={!!errors.description}
                />
              </FormField>

              {/* Time Window & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded border border-slate-200">
                <FormField
                  label="Preferred Block Date"
                  id="preferredDate"
                  required
                  error={errors.preferredDate}
                >
                  <DateInput
                    id="preferredDate"
                    value={formData.preferredDate}
                    onChange={(e) => handleFieldChange('preferredDate', e.target.value)}
                    error={!!errors.preferredDate}
                  />
                </FormField>

                <FormField
                  label="Preferred Start Time"
                  id="preferredStartTime"
                  required
                  error={errors.preferredStartTime}
                >
                  <TimeInput
                    id="preferredStartTime"
                    value={formData.preferredStartTime}
                    onChange={(e) => handleFieldChange('preferredStartTime', e.target.value)}
                    error={!!errors.preferredStartTime}
                  />
                </FormField>

                <FormField
                  label="Preferred End Time"
                  id="preferredEndTime"
                  required
                  error={errors.preferredEndTime}
                >
                  <TimeInput
                    id="preferredEndTime"
                    value={formData.preferredEndTime}
                    onChange={(e) => handleFieldChange('preferredEndTime', e.target.value)}
                    error={!!errors.preferredEndTime}
                  />
                </FormField>
              </div>

              {/* Duration Summary */}
              <div className="flex items-center space-x-4">
                <FormField
                  label="Required Duration (Hours)"
                  id="durationHours"
                >
                  <TextInput
                    id="durationHours"
                    type="number"
                    min={0}
                    max={24}
                    value={formData.durationHours}
                    onChange={(e) => handleFieldChange('durationHours', Number(e.target.value))}
                    className="w-28"
                  />
                </FormField>

                <FormField
                  label="Minutes"
                  id="durationMinutes"
                >
                  <TextInput
                    id="durationMinutes"
                    type="number"
                    min={0}
                    max={59}
                    step={15}
                    value={formData.durationMinutes}
                    onChange={(e) => handleFieldChange('durationMinutes', Number(e.target.value))}
                    className="w-28"
                  />
                </FormField>

                <div className="pt-5 text-xs text-slate-600">
                  Total Block Requested:{' '}
                  <span className="font-bold text-blue-800 font-mono">
                    {formatDuration(formData.durationHours, formData.durationMinutes)}
                  </span>
                </div>
              </div>
              {errors.duration && (
                <p className="text-[11px] text-red-600 font-medium">
                  {errors.duration}
                </p>
              )}
            </div>
          </RequestSection>

          {/* SECTION E: Operational Requirements */}
          <RequestSection
            sectionLetter="E"
            title="Operational & Machinery Requirements"
            description="Track machine deployment, line occupation, speed restrictions, and personnel mobilization."
          >
            <EngineeringMaintenanceFields
              blockRequired={formData.blockRequired}
              disconnectionRequired={formData.disconnectionRequired}
              trafficRestrictionRequired={formData.trafficRestrictionRequired}
              speedRestrictionRequired={formData.speedRestrictionRequired}
              speedRestrictionValue={formData.speedRestrictionValue}
              machineryRequired={formData.machineryRequired}
              maintenanceTeamSize={formData.maintenanceTeamSize}
              onChange={handleFieldChange}
              errors={errors}
            />
          </RequestSection>

          {/* SECTION F: Additional Information */}
          <RequestSection
            sectionLetter="F"
            title="Safety Protocols & Remarks"
            description="Mandatory railway site protection measures and operational remarks."
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Mandatory Railway Safety Protocols <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="space-y-2.5 bg-slate-50 border border-slate-200 rounded p-3">
                  {COMMON_SAFETY_REQUIREMENTS.map((req) => (
                    <Checkbox
                      key={req}
                      id={`safety-${req}`}
                      label={req}
                      checked={formData.safetyRequirements.includes(req)}
                      onChange={() => handleSafetyToggle(req)}
                    />
                  ))}
                </div>
                {errors.safetyRequirements && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">
                    {errors.safetyRequirements}
                  </p>
                )}
              </div>

              <FormField
                label="Site Supervisor Remarks & Coordination Notes"
                id="remarks"
                hint="Provide remarks regarding machine stabling siding, ballast train path, or joint inspection"
              >
                <Textarea
                  id="remarks"
                  rows={2}
                  value={formData.remarks}
                  placeholder="e.g. UNIMAT machine stabled at Aligarh Goods siding. Joint inspection completed with Signal Inspector..."
                  onChange={(e) => handleFieldChange('remarks', e.target.value)}
                />
              </FormField>
            </div>
          </RequestSection>

          {/* Sticky Form Action Bar */}
          <FormActions
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            draftSaved={draftSaved}
            isSubmitting={isSubmitting}
            submitLabel="Submit Engineering Block Request"
            showConfirmModal={showConfirmModal}
            onCloseConfirmModal={() => setShowConfirmModal(false)}
            onConfirmSubmit={handleConfirmedSubmit}
            confirmDetails={{
              requestId: formData.requestId,
              department: 'Engineering',
              systemName: 'TMS',
              corridor: formData.corridor,
              blockSection: formData.blockSection,
              preferredDate: formData.preferredDate,
              duration: formatDuration(formData.durationHours, formData.durationMinutes),
              requestedBy: formData.requestedBy || 'Unspecified'
            }}
          />
        </div>

        {/* Sticky Sidebar Summary */}
        <div className="lg:col-span-4">
          <RequestSummary
            requestId={formData.requestId}
            department="ENGINEERING"
            priority={formData.priority}
            corridor={formData.corridor}
            blockSection={formData.blockSection}
            line={formData.line}
            chainage={`Km ${formData.kilometerStart} - ${formData.kilometerEnd}`}
            assetType={formData.assetType}
            assetId={formData.assetId}
            maintenanceType={formData.maintenanceType}
            preferredDate={formData.preferredDate}
            preferredStartTime={formData.preferredStartTime}
            preferredEndTime={formData.preferredEndTime}
            durationHours={formData.durationHours}
            durationMinutes={formData.durationMinutes}
            teamSize={formData.maintenanceTeamSize}
            safetyCount={formData.safetyRequirements.length}
          />
        </div>
      </div>
    </div>
  );
}
