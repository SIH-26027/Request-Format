'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-300">{t('footer.brand', {}, 'Indian Railways ABPS')}</span>
          <span>&bull;</span>
          <span>{t('footer.systemDesc', {}, 'Automatic Block Planning & Corridor Slot Optimization System')}</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">
          {t('footer.departments', {}, 'Operational Departments: Engineering (TMS) • TRD (TDMS) • S&T (SMMS)')}
        </div>
      </div>
    </footer>
  );
}
