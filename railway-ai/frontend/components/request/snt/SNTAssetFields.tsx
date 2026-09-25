import React from 'react';
import { SNTAssetType, FormValidationErrors } from '../../../types/request';
import { SNT_ASSET_TYPES } from '../../../constants/request.constants';
import FormField from '../common/FormField';
import SelectInput from '../common/SelectInput';
import TextInput from '../common/TextInput';
import Textarea from '../common/Textarea';

interface SNTAssetFieldsProps {
  assetType: SNTAssetType;
  assetId: string;
  equipmentCategory: string;
  defectReason: string;
  onChange: (field: string, value: string) => void;
  errors?: FormValidationErrors;
}

export default function SNTAssetFields({
  assetType,
  assetId,
  equipmentCategory,
  defectReason,
  onChange,
  errors = {}
}: SNTAssetFieldsProps) {
  const categorySuggestions = [
    'Electronic Interlocking (EI - Kyosan / Ansaldo / Medha)',
    'IRS Rotary Point Machine (143mm stroke)',
    'Multi-Section Digital Axle Counter (MSDAC - Frauscher / CEL)',
    'High-Voltage Impulse Track Circuit / DC Track Circuit',
    'Integrated Power Supply (IPS 110V/24V)',
    'LED Signal Lighting Unit (Red/Yellow/Green)',
    'Block Instrument (Single/Double Line Neale’s / Daido)',
    'Optical Fiber Cable (24-Core Armoured OFC)',
    'Interlocked Level Crossing Gate Operating Gear'
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Asset Category */}
        <FormField
          label="Signalling / Telecom Asset Category (SMMS)"
          id="assetType"
          required
          error={errors.assetType}
        >
          <SelectInput
            id="assetType"
            value={assetType}
            options={SNT_ASSET_TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(e) => onChange('assetType', e.target.value)}
            error={!!errors.assetType}
          />
        </FormField>

        {/* Asset ID */}
        <FormField
          label="Gear ID / Point Machine / Signal Post No."
          id="assetId"
          required
          hint="Official signalling yard identifier"
          error={errors.assetId}
        >
          <TextInput
            id="assetId"
            value={assetId}
            placeholder="e.g. PM-TNA-211A or SIG-HOME-S1"
            onChange={(e) => onChange('assetId', e.target.value)}
            error={!!errors.assetId}
          />
        </FormField>
      </div>

      {/* Equipment Category / Make */}
      <FormField
        label="Equipment Make / Sub-System Category"
        id="equipmentCategory"
        required
        hint="Equipment standard and manufacturer reference"
        error={errors.equipmentCategory}
      >
        <SelectInput
          id="equipmentCategory"
          value={equipmentCategory}
          placeholder="-- Select Signalling Gear Category --"
          options={[
            ...categorySuggestions.map((cat) => ({ value: cat, label: cat }))
          ]}
          onChange={(e) => onChange('equipmentCategory', e.target.value)}
          error={!!errors.equipmentCategory}
        />
      </FormField>

      {/* Defect / Maintenance Reason */}
      <FormField
        label="Signalling Failure / Maintenance Reason (SMMS)"
        id="defectReason"
        required
        hint="Detail detection discrepancy, relay chatter, low insulation, or scheduled overhaul"
        error={errors.defectReason}
      >
        <Textarea
          id="defectReason"
          rows={3}
          value={defectReason}
          placeholder="State observed defect: e.g. Point machine detection contact chatter during reverse setting, track circuit insulation resistance dropped to 1.8 ohms/km, or axle counter count mismatch alarm..."
          onChange={(e) => onChange('defectReason', e.target.value)}
          error={!!errors.defectReason}
        />
      </FormField>
    </div>
  );
}
