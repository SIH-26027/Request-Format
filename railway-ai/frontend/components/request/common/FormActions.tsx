'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export interface ConfirmDetails {
  requestId: string;
  department: string;
  systemName: string;
  corridor: string;
  blockSection: string;
  preferredDate: string;
  duration: string;
  requestedBy: string;
}

interface FormActionsProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  draftSaved?: boolean;
  cancelHref?: string;
  submitLabel?: string;
  showConfirmModal?: boolean;
  onCloseConfirmModal?: () => void;
  onConfirmSubmit?: () => void;
  confirmDetails?: ConfirmDetails;
}

export default function FormActions({
  onSaveDraft,
  onSubmit,
  onCancel,
  isSubmitting = false,
  draftSaved = false,
  cancelHref = '/request',
  submitLabel = 'Submit Block Request',
  showConfirmModal = false,
  onCloseConfirmModal,
  onConfirmSubmit,
  confirmDetails
}: FormActionsProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const { t } = useLanguage();

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    if (onCancel) {
      onCancel();
    } else {
      router.push(cancelHref);
    }
  };

  const displaySubmitLabel = submitLabel === 'Submit Block Request' 
    ? t('actions.submit', {}, 'Submit Block Request') 
    : submitLabel;

  return (
    <>
      <div className="bg-slate-100 border border-slate-300 rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky bottom-3 z-20 shadow-md">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          {draftSaved && (
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-medium">
              {t('actions.draftSaved', {}, 'Draft saved locally')}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 justify-end">
          {/* Cancel */}
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center"
          >
            <XCircle className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {t('actions.cancel', {}, 'Cancel')}
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-400 rounded hover:bg-slate-50 transition-colors inline-flex items-center shadow-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 text-blue-700" />
            {t('actions.saveDraft', {}, 'Save Draft')}
          </button>

          {/* Submit */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 border border-blue-800 rounded transition-colors inline-flex items-center shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                {t('actions.submitting', {}, 'Submitting...')}
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {displaySubmitLabel}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-slate-300 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2.5 rounded text-blue-800 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {t('actions.confirmSubmitTitle', {}, 'Confirm Block Request Submission')}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {t('actions.confirmSubmitDesc', {}, 'Are you sure you want to officially submit this maintenance block indent for division sanction?')}
                </p>
              </div>
            </div>

            {confirmDetails && (
              <div className="bg-slate-50 border border-slate-200 rounded p-3.5 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('actions.indentRef', {}, 'Indent Reference:')}</span>
                    <span className="font-mono font-bold text-blue-900">{confirmDetails.requestId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('actions.department', {}, 'Department:')}</span>
                    <span className="font-semibold text-slate-800">{confirmDetails.department} ({confirmDetails.systemName})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('actions.corridor', {}, 'Corridor:')}</span>
                    <span className="font-medium text-slate-800">{confirmDetails.corridor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('actions.blockSection', {}, 'Block Section:')}</span>
                    <span className="font-medium text-slate-800">{confirmDetails.blockSection}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('actions.preferredDateDuration', {}, 'Preferred Date & Duration:')}</span>
                    <span className="font-medium text-slate-800">{confirmDetails.preferredDate} ({confirmDetails.duration})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('actions.requestingOfficer', {}, 'Requesting Officer:')}</span>
                    <span className="font-medium text-slate-800">{confirmDetails.requestedBy}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-[11px] text-blue-900 flex items-start space-x-2">
              <span className="font-bold shrink-0">Note:</span>
              <span>{t('actions.submissionNote', {}, 'Upon confirmation, the indent is saved directly into the division database and forwarded to Sr.DOM / SCOR planning queue.')}</span>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCloseConfirmModal}
                className="px-3.5 py-1.5 text-xs text-slate-700 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
              >
                {t('actions.reviewEdit', {}, 'Review & Edit')}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onConfirmSubmit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 rounded hover:bg-blue-800 inline-flex items-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                    {t('actions.submitting', {}, 'Submitting...')}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {t('actions.confirmSubmit', {}, 'Confirm & Submit')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-slate-300 shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start space-x-3">
              <div className="bg-amber-100 p-2 rounded text-amber-800 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('actions.discardChanges', {}, 'Discard Changes?')}</h3>
                <p className="text-xs text-slate-600 mt-1">
                  {t('actions.discardDesc', {}, 'Any unsaved modifications in this block request form will be discarded.')}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 text-xs text-slate-700 border border-slate-300 rounded hover:bg-slate-100"
              >
                {t('actions.keepEditing', {}, 'Keep Editing')}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                {t('actions.discardExit', {}, 'Discard & Exit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
