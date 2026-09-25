import React from 'react';
import { CORRIDORS, CORRIDOR_STATIONS, TRACK_LINES } from '../../../constants/request.constants';
import FormField from './FormField';
import SelectInput from './SelectInput';
import TextInput from './TextInput';
import { TrackLineType, FormValidationErrors } from '../../../types/request';

interface CorridorSelectorProps {
  corridor: string;
  fromLocation: string;
  toLocation: string;
  blockSection: string;
  line: TrackLineType;
  kilometerStart: string;
  kilometerEnd: string;
  onChange: (field: string, value: string) => void;
  errors?: FormValidationErrors;
}

export default function CorridorSelector({
  corridor,
  fromLocation,
  toLocation,
  blockSection,
  line,
  kilometerStart,
  kilometerEnd,
  onChange,
  errors = {}
}: CorridorSelectorProps) {
  // Find selected corridor object
  const selectedCorridorObj = CORRIDORS.find(c => c.name === corridor);
  const stationOptions = selectedCorridorObj 
    ? (CORRIDOR_STATIONS[selectedCorridorObj.id] || []).map(s => ({ value: s, label: s }))
    : [];

  const handleCorridorChange = (val: string) => {
    onChange('corridor', val);
    const cObj = CORRIDORS.find(c => c.name === val);
    if (cObj) {
      const stations = CORRIDOR_STATIONS[cObj.id] || [];
      if (stations.length >= 2) {
        onChange('fromLocation', stations[0]);
        onChange('toLocation', stations[1]);
        onChange('blockSection', `${stations[0]} - ${stations[1]}`);
      }
    }
  };

  const handleStationChange = (field: 'fromLocation' | 'toLocation', val: string) => {
    onChange(field, val);
    const from = field === 'fromLocation' ? val : fromLocation;
    const to = field === 'toLocation' ? val : toLocation;
    if (from && to) {
      onChange('blockSection', `${from} - ${to}`);
    }
  };

  const handleSwapStations = () => {
    if (!fromLocation && !toLocation) return;
    onChange('fromLocation', toLocation);
    onChange('toLocation', fromLocation);
    if (fromLocation && toLocation) {
      onChange('blockSection', `${toLocation} - ${fromLocation}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Corridor Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <FormField
            label="Corridor / Route Section"
            id="corridor"
            required
            hint="Select sanctioned Indian Railways corridor"
            error={errors.corridor}
          >
            <SelectInput
              id="corridor"
              value={corridor}
              placeholder="-- Select Railway Corridor --"
              options={CORRIDORS.map(c => ({
                value: c.name,
                label: `${c.name} [Zone: ${c.zone}]`
              }))}
              onChange={(e) => handleCorridorChange(e.target.value)}
              error={!!errors.corridor}
            />
          </FormField>

          {/* Corridor Info Badge */}
          {selectedCorridorObj && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-2xs text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded border border-slate-200">
              <span className="font-semibold text-slate-700">Division:</span>
              <span className="text-blue-700 font-medium">{selectedCorridorObj.division}</span>
              <span className="text-slate-300">&bull;</span>
              <span className="font-semibold text-slate-700">Zone:</span>
              <span className="text-emerald-700 font-medium">{selectedCorridorObj.zone}</span>
              <span className="text-slate-300">&bull;</span>
              <span className="font-semibold text-slate-700">Stations:</span>
              <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono font-medium border border-blue-200">
                {stationOptions.length} stations available
              </span>
            </div>
          )}
        </div>

        <div>
          <FormField
            label="Track Line"
            id="line"
            required
            error={errors.line}
          >
            <SelectInput
              id="line"
              value={line}
              options={TRACK_LINES.map(l => ({ value: l.value, label: l.label }))}
              onChange={(e) => onChange('line', e.target.value as TrackLineType)}
              error={!!errors.line}
            />
          </FormField>
        </div>
      </div>

      {/* From Station, To Station, Block Section with Swap Action */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-4">
          <FormField
            label="From Station / Post"
            id="fromLocation"
            required
            error={errors.fromLocation}
          >
            {stationOptions.length > 0 ? (
              <SelectInput
                id="fromLocation"
                value={fromLocation}
                placeholder="Select Station"
                options={stationOptions}
                onChange={(e) => handleStationChange('fromLocation', e.target.value)}
                error={!!errors.fromLocation}
              />
            ) : (
              <TextInput
                id="fromLocation"
                value={fromLocation}
                placeholder="e.g. Erode Jn (ED)"
                onChange={(e) => handleStationChange('fromLocation', e.target.value)}
                error={!!errors.fromLocation}
              />
            )}
          </FormField>
        </div>

        <div className="md:col-span-1 flex justify-center pb-1">
          <button
            type="button"
            onClick={handleSwapStations}
            title="Swap From / To Stations"
            aria-label="Swap From / To Stations"
            className="p-2 text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 rounded border border-slate-300 transition-colors shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7 16-4-4 4-4"/>
              <path d="M3 12h18"/>
              <path d="m17 8 4 4-4 4"/>
            </svg>
          </button>
        </div>

        <div className="md:col-span-3">
          <FormField
            label="To Station / Post"
            id="toLocation"
            required
            error={errors.toLocation}
          >
            {stationOptions.length > 0 ? (
              <SelectInput
                id="toLocation"
                value={toLocation}
                placeholder="Select Station"
                options={stationOptions}
                onChange={(e) => handleStationChange('toLocation', e.target.value)}
                error={!!errors.toLocation}
              />
            ) : (
              <TextInput
                id="toLocation"
                value={toLocation}
                placeholder="e.g. Salem Jn (SA)"
                onChange={(e) => handleStationChange('toLocation', e.target.value)}
                error={!!errors.toLocation}
              />
            )}
          </FormField>
        </div>

        <div className="md:col-span-4">
          <FormField
            label="Designated Block Section"
            id="blockSection"
            required
            hint="Calculated / Section Control Name"
            error={errors.blockSection}
          >
            <TextInput
              id="blockSection"
              value={blockSection}
              placeholder="e.g. ED - SA Block Section"
              onChange={(e) => onChange('blockSection', e.target.value)}
              error={!!errors.blockSection}
            />
          </FormField>
        </div>
      </div>

      {/* Chainage / Kilometer Bounds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-3 rounded border border-slate-200">
        <FormField
          label="Kilometer / Chainage From"
          id="kilometerStart"
          required
          hint="Format: Km / Telegraph Post (e.g. 1314/12)"
          error={errors.kilometerStart}
        >
          <TextInput
            id="kilometerStart"
            value={kilometerStart}
            placeholder="e.g. 1314/12"
            onChange={(e) => onChange('kilometerStart', e.target.value)}
            error={!!errors.kilometerStart}
          />
        </FormField>

        <FormField
          label="Kilometer / Chainage To"
          id="kilometerEnd"
          hint="Format: Km / Telegraph Post (e.g. 1316/04)"
          error={errors.kilometerEnd}
        >
          <TextInput
            id="kilometerEnd"
            value={kilometerEnd}
            placeholder="e.g. 1316/04"
            onChange={(e) => onChange('kilometerEnd', e.target.value)}
            error={!!errors.kilometerEnd}
          />
        </FormField>
      </div>
    </div>
  );
}
