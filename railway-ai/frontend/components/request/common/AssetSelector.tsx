import React from 'react';
import FormField from './FormField';
import SelectInput from './SelectInput';
import TextInput from './TextInput';
import Textarea from './Textarea';
import { FormValidationErrors } from '../../../types/request';

interface AssetSelectorProps {
  assetType: string;
  assetOptions: string[];
  assetId: string;
  assetIdPlaceholder?: string;
  defectReason: string;
  onTypeChange: (type: string) => void;
  onIdChange: (id: string) => void;
  onReasonChange: (reason: string) => void;
  errors?: FormValidationErrors;
  extraField?: React.ReactNode;
}

export default function AssetSelector({
  assetType,
  assetOptions,
  assetId,
  assetIdPlaceholder = 'e.g. ASSET-REF-01',
  defectReason,
  onTypeChange,
  onIdChange,
  onReasonChange,
  errors = {},
  extraField
}: AssetSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Asset Category / Classification"
          id="assetType"
          required
          error={errors.assetType}
        >
          <SelectInput
            id="assetType"
            value={assetType}
            placeholder="-- Select Maintenance Asset Type --"
            options={assetOptions.map(opt => ({ value: opt, label: opt }))}
            onChange={(e) => onTypeChange(e.target.value)}
            error={!!errors.assetType}
          />
        </FormField>

        <FormField
          label="Specific Asset Tag / ID"
          id="assetId"
          required
          hint="Official railway inventory or mast/point number"
          error={errors.assetId}
        >
          <TextInput
            id="assetId"
            value={assetId}
            placeholder={assetIdPlaceholder}
            onChange={(e) => onIdChange(e.target.value)}
            error={!!errors.assetId}
          />
        </FormField>
      </div>

      {extraField && <div>{extraField}</div>}

      <FormField
        label="Defect Description / Maintenance Justification"
        id="defectReason"
        required
        hint="Detail track defect, OMS vibration, OHE wear, or signal error code"
        error={errors.defectReason}
      >
        <Textarea
          id="defectReason"
          rows={3}
          value={defectReason}
          placeholder="State observed defect, OMS acceleration value, ultrasonic flaw detection (USFD) mark, inspection memo reference, or scheduled cyclic maintenance..."
          onChange={(e) => onReasonChange(e.target.value)}
          error={!!errors.defectReason}
        />
      </FormField>
    </div>
  );
}
