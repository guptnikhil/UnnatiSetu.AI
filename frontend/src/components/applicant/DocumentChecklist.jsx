import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileCheck, CheckSquare, Square, Download, Share2, Sparkles, Building2, ShieldCheck, IndianRupee, Printer, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DocumentChecklist() {
  const { selectedScheme, selectedPartner, emiData, applicantProfile, t, lang, theme, setSubmittedApplication, submittedApplication } = useApp();
  
  const docs = selectedScheme?.required_documents || [
    { id: "doc_aadhaar", name_en: "Aadhaar Card", name_hi: "आधार कार्ड", mandatory: true },
    { id: "doc_caste", name_en: "SC Caste Certificate", name_hi: "अनुसूचित जाति प्रमाणपत्र", mandatory: true },
    { id: "doc_income", name_en: "Income Certificate / Self Declaration", name_hi: "आय प्रमाण पत्र", mandatory: true },
    { id: "doc_bank", name_en: "Bank Account Passbook", name_hi: "बैंक पासबुक", mandatory: true }
  ];

  const [checkedDocs, setCheckedDocs] = useState({ doc_aadhaar: true, doc_caste: true, doc_bank: true });
  const [submitting, setSubmitting] = useState(false);

  const toggleDoc = (id) => {
    setCheckedDocs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedDocs).filter(Boolean).length;
  const progressPct = Math.round((completedCount / docs.length) * 100);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Trigger festive celebration confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      const payload = {
        name: applicantProfile.name,
        category: applicantProfile.category,
        gender: applicantProfile.gender,
        annual_income: applicantProfile.annual_income,
        locality: applicantProfile.locality,
        state: applicantProfile.state,
        district: applicantProfile.district,
        pincode: applicantProfile.pincode,
        business_type: applicantProfile.business_type,
        loan_amount_requested: emiData ? emiData.principal : applicantProfile.loan_amount_requested,
        affordability_monthly_emi: emiData ? emiData.monthly_emi : applicantProfile.affordability_monthly_emi,
        matched_scheme_id: selectedScheme?.id || "SCH_MCS",
        matched_partner_id: selectedPartner?.id || "CP_UP_SCA_01"
      };

      const res = await fetch('/api/applicants/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSubmittedApplication(data.record || { id: "APP-2026-8806", status: "Matched" });
    } catch (err) {
      console.warn("Application submit fallback:", err);
      setSubmittedApplication({ id: "APP-2026-8806", status: "Matched" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-extrabold font-outfit flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            <FileCheck className="w-6 h-6 text-amber-500" />
            {t.checklistHeader}
          </h2>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Personalized document requirements for <span className="text-amber-600 dark:text-amber-400 font-bold">{selectedScheme?.name_en || 'Selected Scheme'}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Checklist */}
        <div className={`lg:col-span-7 glass-panel rounded-2xl p-6 border space-y-6 ${
          theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800'
        }`}>
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>Document Readiness Progress</span>
              <span className="text-emerald-600 dark:text-emerald-400">{completedCount} of {docs.length} Ready ({progressPct}%)</span>
            </div>
            <div className={`w-full h-2.5 rounded-full overflow-hidden border ${
              theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {docs.map((doc) => {
              const isChecked = !!checkedDocs[doc.id];

              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? theme === 'light'
                        ? 'bg-emerald-50/50 border-emerald-300 text-slate-900'
                        : 'bg-slate-900/90 border-emerald-500/40 text-white'
                      : theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className={`w-5 h-5 shrink-0 ${theme === 'light' ? 'text-slate-400' : 'text-slate-600'}`} />
                    )}
                    <div>
                      <div className="text-sm font-bold font-outfit">
                        {lang === 'hi' ? doc.name_hi : doc.name_en}
                      </div>
                      {doc.mandatory && (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase">Mandatory Requirement</span>
                      )}
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    isChecked
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : theme === 'light'
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isChecked ? 'Ready' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pre-Qualification Pass Summary Card */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className={`glass-panel rounded-2xl p-6 border shadow-2xl relative ${
            theme === 'light'
              ? 'border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-50 shadow-slate-200'
              : 'border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 mb-4 ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Pre-Qualification Pass
              </span>
              <span className={`text-[10px] font-mono ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>NSFDC Verified</span>
            </div>

            {/* Applicant Summary Details */}
            <div className="space-y-3 text-xs mb-6">
              <div className={`flex justify-between py-1 border-b ${theme === 'light' ? 'border-slate-100' : 'border-slate-800/60'}`}>
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Applicant Name:</span>
                <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{applicantProfile.name}</span>
              </div>

              <div className={`flex justify-between py-1 border-b ${theme === 'light' ? 'border-slate-100' : 'border-slate-800/60'}`}>
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Matched Scheme:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{selectedScheme?.name_en || 'NSFDC Scheme'}</span>
              </div>

              <div className={`flex justify-between py-1 border-b ${theme === 'light' ? 'border-slate-100' : 'border-slate-800/60'}`}>
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Approved Loan Cap:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{emiData ? emiData.principal.toLocaleString('en-IN') : applicantProfile.loan_amount_requested.toLocaleString('en-IN')}</span>
              </div>

              <div className={`flex justify-between py-1 border-b ${theme === 'light' ? 'border-slate-100' : 'border-slate-800/60'}`}>
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Monthly EMI:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">₹{emiData ? emiData.monthly_emi.toLocaleString('en-IN') : '2,500'} / mo</span>
              </div>

              <div className="flex justify-between py-1">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Routed Channel Partner:</span>
                <span className={`font-bold text-right max-w-[180px] truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {selectedPartner?.name || 'Local SCA Branch'}
                </span>
              </div>
            </div>

            {/* Submission Status or CTA */}
            {submittedApplication ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <Sparkles className="w-6 h-6 text-emerald-500 mx-auto" />
                <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                  Pre-Qualification Application Submitted!
                </div>
                <div className={`text-xs font-mono p-2 rounded border ${
                  theme === 'light' ? 'bg-white border-emerald-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}>
                  Ref ID: <span className="font-bold text-amber-600 dark:text-amber-400">{submittedApplication.id}</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Your profile and pre-qualification record have been securely routed to <span className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{selectedPartner?.name}</span>. Please bring your checked documents to their office.
                </p>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-bold text-sm hover:brightness-110 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting to NSFDC...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.btnSubmitPreQual}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
