import React from 'react';
import { TRDAssetType, FormValidationErrors } from '../../../types/request';
import { TRD_ASSET_TYPES } from '../../../constants/request.constants';
import FormField from '../common/FormField';
import SelectInput from '../common/SelectInput';
import TextInput from '../common/TextInput';
import Textarea from '../common/Textarea';

interface TRDAssetFieldsProps {
  assetType: TRDAssetType;
  assetId: string;
  oheSection: string;
  equipmentType: string;
  defectReason: string;
  onChange: (field: string, value: string) => void;
  errors?: FormValidationErrors;
}

export default function TRDAssetFields({
  assetType,
  assetId,
  oheSection,
  equipmentType,
  defectReason,
  onChange,
  errors = {}
}: TRDAssetFieldsProps) {
  const equipmentSuggestions = [
    'Cantilever Assembly & Bracket Tube',
    'Contact Wire (107 sq mm Hard Drawn Copper)',
    'Catenary Wire (65 sq mm Cadmium Copper)',
    'Section Insulator & Runner Assembly',
    '25kV Single Pole Isolator Switch',
    'Auto Tensioning Device (ATD / 3:1 Pulley)',
    'Auxiliary Transformer (AT 25kV / 230V)',
    'Neutral Section / Short Neutral Section Assembly',
    'Pedestal / Post Insulator'
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Asset Category */}
        <FormField
          label="Traction Asset Category (TDMS)"
          id="assetType"
          required
          error={errors.assetType}
        >
          <SelectInput
            id="assetType"
            value={assetType}
            options={TRD_ASSET_TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(e) => onChange('assetType', e.target.value)}
            error={!!errors.assetType}
          />
        </FormField>

        {/* Asset ID / Mast No. */}
        <FormField
          label="Traction Mast No. / Asset Identifier"
          id="assetId"
          required
          hint="e.g. Mast 59/14 or SW-TDL-02"
          error={errors.assetId}
        >
          <TextInput
            id="assetId"
            value={assetId}
            placeholder="e.g. Mast 59/14 or SEC-04/ISOL-12"
            onChange={(e) => onChange('assetId', e.target.value)}
            error={!!errors.assetId}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OHE Elementary Section */}
        <FormField
          label="OHE Elementary Section Code"
          id="oheSection"
          required
          hint="TDMS traction power feeding section"
          error={errors.oheSection}
        >
          <TextInput
            id="oheSection"
            value={oheSection}
            placeholder="e.g. SEC-04 / 102-1 or TSS-GZB/F1"
            onChange={(e) => onChange('oheSection', e.target.value)}
            error={!!errors.oheSection}
          />
        </FormField>

        {/* Equipment Type */}
        <FormField
          label="OHE Sub-Assembly / Equipment Type"
          id="equipmentType"
          hint="Select or type equipment component"
          error={errors.equipmentType}
        >
          <SelectInput
            id="equipmentType"
            value={equipmentType}
            options={[
              { value: '', label: '-- Select Equipment Type --' },
              ...equipmentSuggestions.map((eq) => ({ value: eq, label: eq }))
            ]}
            onChange={(e) => onChange('equipmentType', e.target.value)}
          />
        </FormField>
      </div>

      {/* Defect / Maintenance Reason */}
      <FormField
        label="Traction Defect Description / TDMS Reason"
        id="defectReason"
        required
        hint="State contact wire wear measurement, hot spot detection, flashover, or cyclic AOH/POH schedule"
        error={errors.defectReason}
      >
        <Textarea
          id="defectReason"
          rows={3}
          value={defectReason}
          placeholder="State observed defect: e.g. Contact wire stagger out of tolerance (+240mm), bird nesting near cantilever, chipped porcelain disc insulator, or hot spot detected during thermal audit..."
          onChange={(e) => onChange('defectReason', e.target.value)}
          error={!!errors.defectReason}
        />
      </FormField>
    </div>
  );
}
