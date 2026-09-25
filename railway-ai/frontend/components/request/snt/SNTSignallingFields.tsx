import React from 'react';
import Checkbox from '../common/Checkbox';
import FormField from '../common/FormField';
import TextInput from '../common/TextInput';
import { SNT_EQUIPMENT } from '../../../constants/request.constants';
import { FormValidationErrors } from '../../../types/request';
import { Radio, ShieldAlert } from 'lucide-react';

interface SNTSignallingFieldsProps {
  blockRequired: boolean;
  disconnectionRequired: boolean;
  signallingIsolationRequired: boolean;
  communicationRestrictionRequired: boolean;
  requiredEquipment: string[];
  maintenanceTeamSize: number;
  onChange: (field: string, value: unknown) => void;
  errors?: FormValidationErrors;
}

export default function SNTSignallingFields({
  blockRequired,
  disconnectionRequired,
  signallingIsolationRequired,
  communicationRestrictionRequired,
  requiredEquipment,
  maintenanceTeamSize,
  onChange,
  errors = {}
}: SNTSignallingFieldsProps) {
  const toggleEquipment = (eq: string) => {
    if (requiredEquipment.includes(eq)) {
      onChange('requiredEquipment', requiredEquipment.filter((item) => item !== eq));
    } else {
      onChange('requiredEquipment', [...requiredEquipment, eq]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Signalling Safety & Disconnection Rules */}
      <div className="bg-purple-50/70 border border-purple-200 rounded p-4">
        <div className="flex items-center space-x-2 text-purple-900 mb-3">
          <ShieldAlert className="w-4 h-4 text-purple-700" />
          <h4 className="text-xs font-bold uppercase tracking-wide">
            Signalling Interlocking & Disconnection Protocols (SEM Rules)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox
            id="blockRequired"
            label="Traffic Block Required (Line Occupation)"
            description="Movement over gear must be completely stopped."
            checked={blockRequired}
            onChange={(e) => onChange('blockRequired', e.target.checked)}
          />

          <Checkbox
            id="disconnectionRequired"
            label="Disconnection Memo Form S&T-T/351 to Station Master"
            description="Official disconnection memo must be acknowledged in SM register before gear disconnection."
            checked={disconnectionRequired}
            onChange={(e) => onChange('disconnectionRequired', e.target.checked)}
          />

          <Checkbox
            id="signallingIsolationRequired"
            label="Points Clamped & Padlocked / Route Isolation"
            description="Facing points must be securely clamped in normal position if non-isolated."
            checked={signallingIsolationRequired}
            onChange={(e) => onChange('signallingIsolationRequired', e.target.checked)}
          />

          <Checkbox
            id="communicationRestrictionRequired"
            label="Control Phone / OFC Communication Restriction"
            description="Station-to-station control or block circuit interrupted during line work."
            checked={communicationRestrictionRequired}
            onChange={(e) => onChange('communicationRestrictionRequired', e.target.checked)}
          />
        </div>
      </div>

      {/* S&T Test Equipment */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 mb-2">
          Specialized S&T Testing Instruments & Gauges Required
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-white border border-slate-200 rounded p-3">
          {SNT_EQUIPMENT.map((item) => (
            <Checkbox
              key={item}
              id={`snt-eq-${item}`}
              label={item}
              checked={requiredEquipment.includes(item)}
              onChange={() => toggleEquipment(item)}
            />
          ))}
        </div>
      </div>

      {/* Team Size */}
      <div className="max-w-xs">
        <FormField
          label="Signalling Technicians / Wiremen Gang Size"
          id="maintenanceTeamSize"
          required
          hint="ESM, TCM, Khalasis and Section Supervisor"
          error={errors.maintenanceTeamSize}
        >
          <TextInput
            id="maintenanceTeamSize"
            type="number"
            min={1}
            value={maintenanceTeamSize}
            onChange={(e) => onChange('maintenanceTeamSize', Number(e.target.value))}
            rightElement={<span className="text-slate-500">persons</span>}
            error={!!errors.maintenanceTeamSize}
          />
        </FormField>
      </div>
    </div>
  );
}
