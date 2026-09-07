import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import ConversationalIntake from './components/applicant/ConversationalIntake';
import SchemeRecommender from './components/applicant/SchemeRecommender';
import EMICalculator from './components/applicant/EMICalculator';
import PartnerLocator from './components/applicant/PartnerLocator';
import DocumentChecklist from './components/applicant/DocumentChecklist';
import AdminDashboard from './components/admin/AdminDashboard';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

function MainContent() {
  const { mode, currentStep, theme } = useApp();

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 ${
      theme === 'light'
        ? 'bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-900'
        : 'bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950'
    }`}>
      
      <div>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {mode === 'applicant' ? (
            <div>
              {currentStep === 1 && <ConversationalIntake />}
              {currentStep === 2 && <SchemeRecommender />}
              {currentStep === 3 && <EMICalculator />}
              {currentStep === 4 && <PartnerLocator />}
              {currentStep === 5 && <DocumentChecklist />}
            </div>
          ) : (
            <AdminDashboard />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className={`border-t py-6 mt-12 transition-colors duration-200 ${
        theme === 'light' ? 'bg-white border-slate-200 text-slate-600' : 'border-slate-800/80 bg-slate-950 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
              UnnatiSetu.ai
            </span>
            <span>— Problem Statement ID: SIH26092 (SIH 2026)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className={`px-2.5 py-1 rounded text-[10px] font-mono border ${
              theme === 'light'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-900 text-emerald-400 border-slate-800'
            }`}>
              DPDP Act 2023 Compliant
            </span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by Team The Innovators
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
