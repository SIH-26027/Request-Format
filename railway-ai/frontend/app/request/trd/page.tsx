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
import TRDAssetFields from '../../../components/request/trd/TRDAssetFields';
import TRDElectricalFields from '../../../components/request/trd/TRDElectricalFields';

import { 
  TRDRequestFormData, 
  FormValidationErrors, 
  BlockRequestRecord 
} from '../../../types/request';
import { 
  URGENCIES, 
  TRD_MAINTENANCE_TYPES, 
  COMMON_SAFETY_REQUIREMENTS 
} from '../../../constants/request.constants';
import { 
  generateRequestId, 
  getTodayDateString, 
  getTomorrowDateString,
  calculateDurationFromTimes,
  formatDuration 
} from '../../../utils/request.utils';
import { validateTRDRequest } from '../../../validations/request.validation';
import { RequestService } from '../../../services/request.service';

export default function TRDRequestPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<TRDRequestFormData>({
    department: 'TRD',
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
    assetType: 'OHE',
    assetId: '',
    oheSection: '',
    equipmentType: '',
    defectReason: '',
    maintenanceType: '',
    description: '',
    durationHours: 2,
    durationMinutes: 0,
    preferredDate: getTomorrowDateString(),
    preferredStartTime: '',
    preferredEndTime: '',
    disconnectionRequired: true,
    isolationRequired: true,
    powerShutdownRequired: true,
    earthingRequired: true,
    requiredEquipment: [],
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

    if (!formData.requestId) {
      setFormData((prev: TRDRequestFormData) => ({
        ...prev,
        requestId: generateRequestId('TRD')
      }));
    }
    const savedDraft = RequestService.getDraft<TRDRequestFormData>('TRD');
    if (savedDraft) {
      setFormData(savedDraft);
      setDraftSaved(true);
    }
  }, [router]);

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData((prev: TRDRequestFormData) => {
      const updated = { ...prev, [field]: value };
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
    setFormData((prev: TRDRequestFormData) => {
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
    RequestService.saveDraft('TRD', formData);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 4000);
  };

  const handleSubmit = () => {
    setSubmitError(null);
    const validationErrors = validateTRDRequest(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowConfirmModal(false);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const totalMins = Number(formData.durationHours) * 60 + Number(formData.durationMinutes);
    const newRecord: BlockRequestRecord = {
      id: formData.requestId,
      department: 'TRD',
      departmentName: 'Traction Distribution (TRD)',
      systemName: 'TDMS',
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
        { label: '25kV Traction Power Shutdown', value: formData.powerShutdownRequired },
        { label: 'Elementary Section Isolation', value: formData.isolationRequired },
        { label: 'Both Ends Discharge Earthing', value: formData.earthingRequired },
        { label: 'Auxiliary Transformer Cutoff', value: formData.disconnectionRequired }
      ],
      equipmentRequired: formData.requiredEquipment,
      teamSize: formData.maintenanceTeamSize,
      safetyRequirements: formData.safetyRequirements,
      remarks: formData.remarks,
      timeline: [
        {
          status: 'DRAFT',
          label: 'Draft Created',
          timestamp: `${formData.requestDate} 11:20`,
          officer: `${formData.requestedBy} (${formData.designation})`,
          isCompleted: true,
          isCurrent: false
        },
        {
          status: 'SUBMITTED',
          label: 'Submitted to TDMS Planning Cell',
          timestamp: `${formData.requestDate} 12:00`,
          officer: `${formData.requestedBy} (${formData.designation})`,
          note: 'Power shutdown window requested in night low-density slot.',
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
          label: 'Sanctioned by TPC & Sr.DOM',
          isCompleted: false,
          isCurrent: false
        },
        {
          status: 'COMPLETED',
          label: 'OHE Energization & Clearance',
          isCompleted: false,
          isCurrent: false
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await RequestService.save(newRecord);
      RequestService.clearDraft('TRD');
      setShowConfirmModal(false);
      setIsSubmitting(false);
      setSubmitSuccess(newRecord.id);
      router.push(`/request/submitted?id=${formData.requestId}&dept=TRD`);
    } catch (err: any) {
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setSubmitError(err?.message || 'Database error: The request was not submitted. Please try again.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <RequestHeader
        title="Traction Distribution (TRD) Block Request"
        subtitle="Submit a maintenance block and traction disconnection request for OHE and traction infrastructure."
        department="TRD"
        systemName="TDMS"
        backLink="/request"
        backText="Back to Department Selection"
        breadcrumbs={[
          { label: 'Block Portal', href: '/request' },
          { label: 'Traction Distribution (TDMS)' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
            description="Authorizing officer credentials, reference code, and priority rating."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="TRD Block Indent Reference"
                  id="requestId"
                  hint="Auto-generated TDMS reference"
                >
                  <TextInput
                    id="requestId"
                    value={formData.requestId}
                    readOnly
                    className="font-mono bg-slate-100 text-sky-900 font-bold"
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
                  label="Requested By (TRD Authority)"
                  id="requestedBy"
                  required
                  error={errors.requestedBy}
                >
                  <TextInput
                    id="requestedBy"
                    value={formData.requestedBy}
                    placeholder="Full name of Traction Engineer"
                    onChange={(e) => handleFieldChange('requestedBy', e.target.value)}
                    error={!!errors.requestedBy}
                  />
                </FormField>

                <FormField
                  label="Designation / Depot"
                  id="designation"
                  required
                  error={errors.designation}
                >
                  <TextInput
                    id="designation"
                    value={formData.designation}
                    placeholder="e.g. SSE / TRD / KGP"
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
                    placeholder="+91 94340 19283"
                    onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                    error={!!errors.contactNumber}
                  />
                </FormField>
              </div>

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
            description="Traction feeding zone, track line, and overhead equipment chainage."
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

          {/* SECTION C: Traction Asset Information */}
          <RequestSection
            sectionLetter="C"
            title="Traction Asset Information"
            description="OHE mast, insulator assembly, and elementary feeding section."
          >
            <TRDAssetFields
              assetType={formData.assetType}
              assetId={formData.assetId}
              oheSection={formData.oheSection}
              equipmentType={formData.equipmentType}
              defectReason={formData.defectReason}
              onChange={handleFieldChange}
              errors={errors}
            />
          </RequestSection>

          {/* SECTION D: Maintenance Details */}
          <RequestSection
            sectionLetter="D"
            title="Maintenance Work Details"
            description="Type of OHE overhaul, description, and preferred power shutdown window."
          >
            <div className="space-y-4">
              <FormField
                label="Traction Maintenance Work Type"
                id="maintenanceType"
                required
                error={errors.maintenanceType}
              >
                <SelectInput
                  id="maintenanceType"
                  value={formData.maintenanceType}
                  placeholder="-- Select TRD Maintenance Activity --"
                  options={TRD_MAINTENANCE_TYPES.map((t) => ({ value: t, label: t }))}
                  onChange={(e) => handleFieldChange('maintenanceType', e.target.value)}
                  error={!!errors.maintenanceType}
                />
              </FormField>

              <FormField
                label="Detailed Scope of Work"
                id="description"
                required
                hint="Detail OHE component replacement, tower wagon movement, and tension checking"
                error={errors.description}
              >
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  placeholder="State work plan: e.g. Annual overhaul of OHE between Mast 58/10 and 62/22, dropper replacement, steady arm checking by tower wagon..."
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  error={!!errors.description}
                />
              </FormField>

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
                  Total Power Block Window:{' '}
                  <span className="font-bold text-sky-800 font-mono">
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

          {/* SECTION E: Electrical / Traction Requirements */}
          <RequestSection
            sectionLetter="E"
            title="Electrical & Traction Clearances"
            description="25kV power disconnection, earthing rods, tower wagon rolling stock, and linemen gang."
          >
            <TRDElectricalFields
              disconnectionRequired={formData.disconnectionRequired}
              isolationRequired={formData.isolationRequired}
              powerShutdownRequired={formData.powerShutdownRequired}
              earthingRequired={formData.earthingRequired}
              requiredEquipment={formData.requiredEquipment}
              maintenanceTeamSize={formData.maintenanceTeamSize}
              onChange={handleFieldChange}
              errors={errors}
            />
          </RequestSection>

          {/* SECTION F: Additional Information */}
          <RequestSection
            sectionLetter="F"
            title="Safety Protocols & Remarks"
            description="Traction safety mandates, ACTM compliance, and TPC permit notes."
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Mandatory Railway Electrical Safety Protocols <span className="text-red-600 font-bold">*</span>
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
                label="Traction Power Controller (TPC) Coordination & Remarks"
                id="remarks"
                hint="Provide remarks regarding feeding post, feeder breaker code, or night isolation"
              >
                <Textarea
                  id="remarks"
                  rows={2}
                  value={formData.remarks}
                  placeholder="e.g. TPC Garden Reach permit coordinated. Isolation to be initiated immediately following pass of Train 12840..."
                  onChange={(e) => handleFieldChange('remarks', e.target.value)}
                />
              </FormField>
            </div>
          </RequestSection>

          <FormActions
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            draftSaved={draftSaved}
            isSubmitting={isSubmitting}
            submitLabel="Submit TRD Block Request"
            showConfirmModal={showConfirmModal}
            onCloseConfirmModal={() => setShowConfirmModal(false)}
            onConfirmSubmit={handleConfirmedSubmit}
            confirmDetails={{
              requestId: formData.requestId,
              department: 'Traction Distribution',
              systemName: 'TDMS',
              corridor: formData.corridor,
              blockSection: formData.blockSection,
              preferredDate: formData.preferredDate,
              duration: formatDuration(formData.durationHours, formData.durationMinutes),
              requestedBy: formData.requestedBy || 'Unspecified'
            }}
          />
        </div>

        <div className="lg:col-span-4">
          <RequestSummary
            requestId={formData.requestId}
            department="TRD"
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
