'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Layers, 
  FileText, 
  Clock, 
  Building2,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import LanguageSwitcher from '../../common/LanguageSwitcher';
import { useLanguage } from '../../../context/LanguageContext';

function LiveClock() {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' ' + now.toLocaleTimeString('en-GB', { hour12: false }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-emerald-300 font-medium">{currentTime || 'Loading clock...'}</span>;
}

export default function TopNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navLinks = [
    { 
      label: t('nav.submitRequest', {}, 'Submit Block Request'), 
      href: '/request', 
      icon: FileText, 
      active: pathname.startsWith('/request') && !pathname.startsWith('/requests') 
    },
    { 
      label: t('nav.requestsTable', {}, 'Block Requests Table'), 
      href: '/requests', 
      icon: Layers, 
      active: pathname === '/requests' || pathname.startsWith('/requests/') 
    },
    { 
      label: t('nav.approvedBlocks', {}, 'COA Approved Blocks'), 
      href: '/approved-blocks', 
      icon: CheckCircle2, 
      active: pathname.startsWith('/approved-blocks') || pathname.startsWith('/coa-approved'),
      highlight: true
    },
  ];

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-700 sticky top-0 z-50 shadow-md">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-slate-800">
          {/* Brand & System Title */}
          <Link href="/requests" prefetch={true} className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 p-1 flex items-center justify-center shadow-inner group-hover:border-blue-500 transition-colors shrink-0">
              {/* Official IR ABPS Emblem Inline */}
              <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
                <circle cx="24" cy="24" r="23" fill="#0f172a" stroke="#1e3a8a" strokeWidth="2"/>
                <circle cx="24" cy="24" r="20" fill="#1e293b"/>
                <circle cx="24" cy="18.5" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2 1.5"/>
                <circle cx="24" cy="24" r="16" fill="#1e40af"/>
                <path d="M21 11h6M24 11v3" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="14" y="14" width="20" height="18" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="1"/>
                <rect x="16.5" y="16.5" width="6.5" height="5" rx="1" fill="#0284c7"/>
                <rect x="25" y="16.5" width="6.5" height="5" rx="1" fill="#0284c7"/>
                <rect x="14" y="23" width="20" height="1.3" fill="#ff9933"/>
                <rect x="14" y="24.3" width="20" height="1.3" fill="#ffffff"/>
                <rect x="14" y="25.6" width="20" height="1.3" fill="#138808"/>
                <circle cx="24" cy="29" r="2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8"/>
                <circle cx="24" cy="29" r="0.8" fill="#ffffff"/>
                <path d="M13 32h22l-2.5 4h-17z" fill="#dc2626"/>
                <line x1="12" y1="39" x2="36" y2="39" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
                <line x1="15" y1="43" x2="33" y2="43" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="17" y1="38" x2="14" y2="44" stroke="#cbd5e1" strokeWidth="1.8"/>
                <line x1="24" y1="38" x2="24" y2="44" stroke="#cbd5e1" strokeWidth="1.8"/>
                <line x1="31" y1="38" x2="34" y2="44" stroke="#cbd5e1" strokeWidth="1.8"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold tracking-wide text-white text-sm group-hover:text-blue-300 transition-colors">
                  {t('nav.brand', {}, 'INDIAN RAILWAYS')}
                </span>
                <span className="text-xs bg-slate-800 text-blue-300 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                  {t('nav.systemVersion', {}, 'ABPS v2.4')}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium leading-none mt-0.5">
                {t('nav.systemTitle', {}, 'Automatic Block Planning System')} &bull; {t('nav.portalSubtitle', {}, 'Maintenance Block Portal')}
              </p>
            </div>
          </Link>

          {/* Operating Context, Clock & Language Switcher (Top Right Corner) */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs text-slate-300">
            {/* Control Zone & Division */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">{t('nav.controlZone', {}, 'Control Zone & Division:')}</span>
              <span className="font-semibold text-slate-200">{t('nav.zoneDivision', {}, 'Southern Railway (SR) / Chennai & Salem')}</span>
            </div>

            {/* Live Clock */}
            <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <LiveClock />
            </div>

            {/* Language Switcher in Top Right Corner */}
            <LanguageSwitcher variant="dark" />
          </div>
        </div>

        {/* Primary Tab Navigation */}
        <div className="flex items-center justify-between h-11 overflow-x-auto">
          <nav className="flex space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    link.active
                      ? 'bg-blue-700 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {link.label}
                  {link.highlight && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      COA
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400 pl-2 shrink-0">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span className="text-slate-300 font-mono text-[11px]">{t('nav.corridorStatus', {}, 'CORRIDOR STATUS: NORMAL')}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
