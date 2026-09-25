import React from 'react';
import Checkbox from '../common/Checkbox';
import FormField from '../common/FormField';
import TextInput from '../common/TextInput';
import { TRD_EQUIPMENT } from '../../../constants/request.constants';
import { FormValidationErrors } from '../../../types/request';
import { Zap, AlertTriangle } from 'lucide-react';

interface TRDElectricalFieldsProps {
  disconnectionRequired: boolean;
  isolationRequired: boolean;
  powerShutdownRequired: boolean;
  earthingRequired: boolean;
  requiredEquipment: string[];
  maintenanceTeamSize: number;
  onChange: (field: string, value: unknown) => void;
  errors?: FormValidationErrors;
}

export default function TRDElectricalFields({
  disconnectionRequired,
  isolationRequired,
  powerShutdownRequired,
  earthingRequired,
  requiredEquipment,
  maintenanceTeamSize,
  onChange,
  errors = {}
}: TRDElectricalFieldsProps) {
  const toggleEquipment = (eq: string) => {
    if (requiredEquipment.includes(eq)) {
      onChange('requiredEquipment', requiredEquipment.filter((item) => item !== eq));
    } else {
      onChange('requiredEquipment', [...requiredEquipment, eq]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Traction Power Clearance Protocol */}
      <div className="bg-sky-50/70 border border-sky-200 rounded p-4">
        <div className="flex items-center space-x-2 text-sky-900 mb-3">
          <Zap className="w-4 h-4 text-sky-700" />
          <h4 className="text-xs font-bold uppercase tracking-wide">
            25kV Traction Power & Electrical Isolation Requirements
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Checkbox
            id="powerShutdownRequired"
            label="25kV OHE Power Shutdown Required"
            description="Traction power supply to the elementary section will be de-energized by TPC."
            checked={powerShutdownRequired}
            onChange={(e) => onChange('powerShutdownRequired', e.target.checked)}
          />

          <Checkbox
            id="isolationRequired"
            label="Substation / Feeder Isolator Opening Required"
            description="Isolator switches will be opened and locked in open position."
            checked={isolationRequired}
            onChange={(e) => onChange('isolationRequired', e.target.checked)}
          />

          <Checkbox
            id="earthingRequired"
            label="Discharge Earthing at Both Ends of Work Zone"
            description="Approved discharge rods must be clamped to earth and contact wire before permit to work."
            checked={earthingRequired}
            error={!!errors.earthingRequired}
            onChange={(e) => onChange('earthingRequired', e.target.checked)}
          />

          <Checkbox
            id="disconnectionRequired"
            label="Auxiliary Transformer (AT) Disconnection Required"
            description="Local signalling/station 230V AT supply will be cut during block."
            checked={disconnectionRequired}
            onChange={(e) => onChange('disconnectionRequired', e.target.checked)}
          />
        </div>

        {powerShutdownRequired && !earthingRequired && (
          <div className="mt-3 flex items-center space-x-2 text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Safety Mandate:</strong> Earthing rods are mandatory under Indian Railways ACTM rules for any 25kV power block.
            </span>
          </div>
        )}
      </div>

      {/* TRD Equipment / Rolling Stock */}
      <div>
        <label className="block text-xs font-semibold text-slate-800 mb-2">
          TRD Machinery & Specialized Tools Required
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-white border border-slate-200 rounded p-3">
          {TRD_EQUIPMENT.map((item) => (
            <Checkbox
              key={item}
              id={`trd-eq-${item}`}
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
          label="Traction Linemen / TRD Gang Size"
          id="maintenanceTeamSize"
          required
          hint="Linemen, supervisors and tower wagon crew"
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
