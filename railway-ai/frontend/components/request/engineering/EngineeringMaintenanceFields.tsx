import React from 'react';
import Checkbox from '../common/Checkbox';
import FormField from '../common/FormField';
import TextInput from '../common/TextInput';
import { ENGINEERING_MACHINERY } from '../../../constants/request.constants';
import { FormValidationErrors } from '../../../types/request';

interface EngineeringMaintenanceFieldsProps {
  blockRequired: boolean;
  disconnectionRequired: boolean;
  trafficRestrictionRequired: boolean;
  speedRestrictionRequired: boolean;
  speedRestrictionValue?: number;
  machineryRequired: string[];
  maintenanceTeamSize: number;
  onChange: (field: string, value: unknown) => void;
  errors?: FormValidationErrors;
}

export default function EngineeringMaintenanceFields({
  blockRequired,
  disconnectionRequired,
  trafficRestrictionRequired,
  speedRestrictionRequired,
  speedRestrictionValue = 30,
  machineryRequired,
  maintenanceTeamSize,
  onChange,
  errors = {}
}: EngineeringMaintenanceFieldsProps) {
  const toggleMachinery = (machine: string) => {
    if (machineryRequired.includes(machine)) {
      onChange('machineryRequired', machineryRequired.filter((m) => m !== machine));
    } else {
      onChange('machineryRequired', [...machineryRequired, machine]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Primary Operational Checklist */}
      <div className="bg-slate-50 border border-slate-200 rounded p-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
          Track Operational Clearances & Restrictions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox
            id="blockRequired"
            label="Traffic Block Required (Total line occupation)"
            description="Train movements on affected track line must be suspended during window."
            checked={blockRequired}
            onChange={(e) => onChange('blockRequired', e.target.checked)}
          />

          <Checkbox
            id="disconnectionRequired"
            label="S&T / Track Circuit Disconnection Required"
            description="Insulated rail joints or point detection rods will be disturbed."
            checked={disconnectionRequired}
            onChange={(e) => onChange('disconnectionRequired', e.target.checked)}
          />

          <Checkbox
            id="trafficRestrictionRequired"
            label="Adjacent Line Traffic Restriction Required"
            description="Trains on adjacent line must observe cautionary horn or reduced speed."
            checked={trafficRestrictionRequired}
            onChange={(e) => onChange('trafficRestrictionRequired', e.target.checked)}
          />

          <div className="space-y-2">
            <Checkbox
              id="speedRestrictionRequired"
              label="Temporary Speed Restriction (TSR) Post-Block"
              description="Track consolidation required before full speed restoration."
              checked={speedRestrictionRequired}
              onChange={(e) => onChange('speedRestrictionRequired', e.target.checked)}
            />
            {speedRestrictionRequired && (
              <div className="pl-6">
                <FormField
                  label="Permitted Speed Limit (kmph)"
                  id="speedRestrictionValue"
                  required
                  error={errors.speedRestrictionValue}
                >
                  <TextInput
                    id="speedRestrictionValue"
                    type="number"
                    min={10}
                    max={100}
                    value={speedRestrictionValue}
                    onChange={(e) => onChange('speedRestrictionValue', Number(e.target.value))}
                    className="w-32"
                    rightElement={<span className="font-mono text-slate-500">km/h</span>}
                  />
                </FormField>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Machinery / Track Equipment Required */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 mb-2">
          Track Machinery / On-Track Maintenance Machines Required
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-white border border-slate-200 rounded p-3">
          {ENGINEERING_MACHINERY.map((machine) => (
            <Checkbox
              key={machine}
              id={`machine-${machine}`}
              label={machine}
              checked={machineryRequired.includes(machine)}
              onChange={() => toggleMachinery(machine)}
            />
          ))}
        </div>
      </div>

      {/* Gang / Team Size */}
      <div className="max-w-xs">
        <FormField
          label="Trackmen Gang / Engineering Team Size"
          id="maintenanceTeamSize"
          required
          hint="Total personnel deployed on site"
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
