import React from 'react';
import { EngineeringAssetType, FormValidationErrors } from '../../../types/request';
import { ENGINEERING_ASSET_TYPES } from '../../../constants/request.constants';
import FormField from '../common/FormField';
import SelectInput from '../common/SelectInput';
import TextInput from '../common/TextInput';
import Textarea from '../common/Textarea';

interface EngineeringAssetFieldsProps {
  assetType: EngineeringAssetType;
  assetId: string;
  assetCondition: 'GOOD' | 'FAIR' | 'CRITICAL' | 'SEVERE_WEAR';
  defectReason: string;
  onChange: (field: string, value: string) => void;
  errors?: FormValidationErrors;
}

export default function EngineeringAssetFields({
  assetType,
  assetId,
  assetCondition,
  defectReason,
  onChange,
  errors = {}
}: EngineeringAssetFieldsProps) {
  const conditionOptions = [
    { value: 'GOOD', label: 'Good (Routine Preventive Maintenance)' },
    { value: 'FAIR', label: 'Fair (Early signs of degradation/settlement)' },
    { value: 'CRITICAL', label: 'Critical (Exceeding safety maintenance limit)' },
    { value: 'SEVERE_WEAR', label: 'Severe Wear / Fracture Risk (Immediate)' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Asset Category */}
        <FormField
          label="Track Asset Category (TMS)"
          id="assetType"
          required
          error={errors.assetType}
        >
          <SelectInput
            id="assetType"
            value={assetType}
            options={ENGINEERING_ASSET_TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(e) => onChange('assetType', e.target.value)}
            error={!!errors.assetType}
          />
        </FormField>

        {/* Asset ID */}
        <FormField
          label="Asset ID / Turnout / Segment No."
          id="assetId"
          required
          hint="TMS track identification code"
          error={errors.assetId}
        >
          <TextInput
            id="assetId"
            value={assetId}
            placeholder="e.g. PNT-ALJN-104B or TRK-UP-1314"
            onChange={(e) => onChange('assetId', e.target.value)}
            error={!!errors.assetId}
          />
        </FormField>

        {/* Asset Condition */}
        <FormField
          label="Track Asset Condition"
          id="assetCondition"
          required
          error={errors.assetCondition}
        >
          <SelectInput
            id="assetCondition"
            value={assetCondition}
            options={conditionOptions}
            onChange={(e) => onChange('assetCondition', e.target.value)}
            error={!!errors.assetCondition}
          />
        </FormField>
      </div>

      {/* Defect / Maintenance Reason */}
      <FormField
        label="Defect Description / TMS Maintenance Justification"
        id="defectReason"
        required
        hint="Detail track geometry defects, OMS peak acceleration, USFD flaw flaw detected, or cyclic schedule"
        error={errors.defectReason}
      >
        <Textarea
          id="defectReason"
          rows={3}
          value={defectReason}
          placeholder="State observed defect: e.g. CMS crossing nose wear exceeded 6mm, gauge widening +8mm, cross-level variation 12mm, or deep screening ballast fouling..."
          onChange={(e) => onChange('defectReason', e.target.value)}
          error={!!errors.defectReason}
        />
      </FormField>
    </div>
  );
}
