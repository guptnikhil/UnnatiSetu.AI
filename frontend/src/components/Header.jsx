import React, { useState } from 'react';
import { useApp, SUPPORTED_LANGUAGES } from '../context/AppContext';
import { ShieldCheck, Globe, UserCheck, LayoutDashboard, Sparkles, ChevronRight, Sun, Moon } from 'lucide-react';

export default function Header() {
  const { lang, setLang, theme, toggleTheme, t, mode, setMode, currentStep, setCurrentStep } = useApp();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const steps = [
    { num: 1, label: t.step1 },
    { num: 2, label: t.step2 },
    { num: 3, label: t.step3 },
    { num: 4, label: t.step4 },
    { num: 5, label: t.step5 }
  ];

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <header className={`sticky top-0 z-50 glass-panel border-b transition-colors duration-200 ${
      theme === 'light' ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setMode('applicant')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                theme === 'light' ? 'bg-white' : 'bg-slate-950'
              }`}>
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-extrabold tracking-tight font-outfit ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {t.brandName}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> SIH 2026
                </span>
              </div>
              <p className={`text-xs font-medium hidden sm:block ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {t.brandTagline}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Theme Toggle Button (Dark vs White Mode) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                theme === 'light'
                  ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 shadow-sm'
                  : 'bg-slate-900/90 border-slate-700 text-amber-400 hover:border-amber-500/50 shadow-sm'
              }`}
              title="Toggle Dark / White Mode"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden md:inline">{t.themeToggleDark}</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">{t.themeToggleLight}</span>
                </>
              )}
            </button>

            {/* Multilingual Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  theme === 'light'
                    ? 'bg-white border-slate-300 text-slate-800 hover:border-amber-500 shadow-sm'
                    : 'bg-slate-900/90 border-slate-700/60 text-slate-200 hover:border-amber-500/50 shadow-sm'
                }`}
                title="Select Language / भाषा चुनें"
              >
                <Globe className="w-4 h-4 text-amber-500" />
                <span className="font-bold">{currentLangObj.native}</span>
              </button>

              {langDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl py-2 z-50 ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 shadow-slate-200'
                    : 'bg-slate-900 border-slate-800 shadow-black/80'
                }`}>
                  <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200/20 mb-1">
                    Select Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-all ${
                        lang === l.code
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : theme === 'light'
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className={`text-[10px] ${lang === l.code ? 'text-slate-900' : 'text-slate-400'}`}>
                        {l.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mode Switcher (Applicant vs Admin) */}
            {mode === 'applicant' ? (
              <button
                onClick={() => setMode('admin')}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.navAdminMode}</span>
              </button>
            ) : (
              <button
                onClick={() => setMode('applicant')}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  theme === 'light'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{t.navApplicantMode}</span>
              </button>
            )}
          </div>
        </div>

        {/* Step Progress Breadcrumb for Applicant Mode */}
        {mode === 'applicant' && (
          <div className={`py-3 border-t overflow-x-auto scrollbar-none ${
            theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'
          }`}>
            <div className="flex items-center space-x-2 min-w-max">
              {steps.map((s, idx) => {
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                return (
                  <React.Fragment key={s.num}>
                    <button
                      onClick={() => setCurrentStep(s.num)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : isCompleted
                          ? theme === 'light'
                            ? 'bg-amber-100/60 text-amber-900 border border-amber-200 font-semibold'
                            : 'bg-slate-800/90 text-amber-400 border border-slate-700'
                          : theme === 'light'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/60'
                          : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : isCompleted
                          ? 'bg-amber-500/20 text-amber-500'
                          : theme === 'light'
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {s.num}
                      </span>
                      <span>{s.label}</span>
                    </button>
                    {idx < steps.length - 1 && (
                      <ChevronRight className={`w-4 h-4 shrink-0 ${theme === 'light' ? 'text-slate-300' : 'text-slate-700'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
