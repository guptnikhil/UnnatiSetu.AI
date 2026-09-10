import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mic, Sparkles, Send, User, Layers, CheckCircle2, Loader2 } from 'lucide-react';
import VoiceAgentOverlay from './VoiceAgentOverlay';

export default function ConversationalIntake() {
  const {
    t, theme, applicantProfile, setApplicantProfile,
    evaluateSchemes, loading, extractProfileSarvam, detectAndSetLanguage
  } = useApp();

  const [inputText, setInputText] = useState("");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  const samplePersonas = [
    {
      label: t.persona1,
      profile: {
        name: "Ramesh Kumar",
        category: "SC",
        gender: "Male",
        annual_income: 120000,
        locality: "Rural",
        state: "Uttar Pradesh",
        district: "Lucknow",
        pincode: "226001",
        business_type: "Micro Enterprise",
        loan_amount_requested: 100000,
        affordability_monthly_emi: 2500
      },
      text: "I am Ramesh Kumar, SC category from Lucknow rural. I earn ₹1.2 Lakh annually and want a ₹1,00,000 loan for a small retail shop."
    },
    {
      label: t.persona2,
      profile: {
        name: "Sunita Devi",
        category: "SC",
        gender: "Female",
        annual_income: 95000,
        locality: "Rural",
        state: "Bihar",
        district: "Patna",
        pincode: "800001",
        business_type: "Dairy/Agri",
        loan_amount_requested: 120000,
        affordability_monthly_emi: 2200
      },
      text: "मैं सुनीता देवी, अनुसूचित जाति महिला किसान हूँ। मैं पटना ग्रामीण से हूँ और डेयरी उद्योग के लिए ₹1,20,000 ऋण चाहती हूँ।"
    },
    {
      label: t.persona3,
      profile: {
        name: "Anita Rani",
        category: "SC",
        gender: "Female",
        annual_income: 150000,
        locality: "Urban",
        state: "Delhi",
        district: "Central Delhi",
        pincode: "110001",
        business_type: "Beauty Parlour",
        loan_amount_requested: 140000,
        affordability_monthly_emi: 3000
      },
      text: "I am Anita Rani from Delhi, SC category. I want a loan of ₹1,40,000 under Mahila Samriddhi Yojana for my beauty parlour."
    }
  ];

  const triggerFieldHighlight = () => {
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 2000);
  };

  const handleApplyPersona = (p) => {
    setApplicantProfile(p.profile);
    setInputText(p.text);
    triggerFieldHighlight();
  };

  const handleTextParseExtract = async () => {
    if (!inputText.trim()) return;
    setIsTranscribing(true);
    await detectAndSetLanguage(inputText);
    const extracted = await extractProfileSarvam(inputText);
    if (extracted && Object.keys(extracted).length > 0) {
      setApplicantProfile(prev => ({ ...prev, ...extracted }));
      triggerFieldHighlight();
    }
    setIsTranscribing(false);
  };

  const handleEvaluate = () => {
    evaluateSchemes(applicantProfile);
  };

  const handleSubmit = async () => {
    if (inputText.trim()) {
      await handleTextParseExtract();
    }
    handleEvaluate();
  };

  const isDark = theme !== 'light';

  return (
    <div className="space-y-6">

      {/* Quick Personas Banner — Original Top Banner */}
      <div className={`glass-panel rounded-2xl p-5 border shadow-xl transition-colors ${
        isDark
          ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border-slate-800'
          : 'bg-gradient-to-r from-amber-50/80 via-white to-orange-50/50 border-amber-200'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2 text-amber-500 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{t.quickPersonaPrompt}</span>
          </div>
          <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Select to auto-populate profile
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {samplePersonas.map((p, i) => (
            <button
              key={i}
              onClick={() => handleApplyPersona(p)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 shadow-sm border cursor-pointer ${
                isDark
                  ? 'bg-slate-800/90 hover:bg-amber-500/20 border-slate-700 hover:border-amber-500/50 text-slate-200'
                  : 'bg-white hover:bg-amber-100/60 border-slate-200 hover:border-amber-400 text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversational Intake Input Card */}
      <div className={`glass-panel rounded-2xl p-6 border shadow-2xl relative overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold font-outfit flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Send className="w-5 h-5 text-amber-500" />
            {t.intakeHeader}
          </h2>
          <div className="flex items-center gap-2">
            {justUpdated && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                ✓ Synced to Profile
              </span>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}>
              Natural Language NLP Intake
            </span>
          </div>
        </div>

        {/* Text Input Box with Floating Mic Button */}
        <div className="relative mb-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.intakePlaceholder}
            rows={4}
            className={`w-full border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none font-sans ${
              isDark
                ? 'bg-slate-950/90 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-amber-500/80'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
            }`}
          />

          {/* Voice Mic Button — Floating inside textarea (Original UI) */}
          <div className="absolute right-3 bottom-3">
            <button
              onClick={() => setIsVoiceOpen(true)}
              disabled={isTranscribing}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                isTranscribing
                  ? 'bg-amber-500 cursor-wait animate-pulse shadow-amber-500/30'
                  : 'bg-gradient-to-br from-amber-500 to-orange-500 hover:scale-110 hover:shadow-amber-500/40'
              }`}
              title="Click to Speak (Voice Input)"
            >
              {isTranscribing ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Manual Field Tweaker Grid */}
        <div className={`mb-6 pt-4 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            {t.extractHeader}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Category */}
            <div className={`p-3 rounded-xl border transition-all ${
              justUpdated ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' : ''
            } ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Social Category</span>
              <select
                value={applicantProfile.category}
                onChange={(e) => setApplicantProfile({ ...applicantProfile, category: e.target.value })}
                className="w-full bg-transparent text-xs font-bold text-amber-500 focus:outline-none cursor-pointer mt-1"
              >
                <option value="SC" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>SC (Scheduled Caste)</option>
                <option value="ST" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>ST (Scheduled Tribe)</option>
                <option value="OBC" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>OBC</option>
                <option value="General" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>General</option>
              </select>
            </div>

            {/* Gender */}
            <div className={`p-3 rounded-xl border transition-all ${
              justUpdated ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' : ''
            } ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Gender</span>
              <select
                value={applicantProfile.gender}
                onChange={(e) => setApplicantProfile({ ...applicantProfile, gender: e.target.value })}
                className="w-full bg-transparent text-xs font-bold text-amber-500 focus:outline-none cursor-pointer mt-1"
              >
                <option value="Female" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Female (महिला)</option>
                <option value="Male" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Male (पुरुष)</option>
                <option value="Other" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Other</option>
              </select>
            </div>

            {/* Annual Income */}
            <div className={`p-3 rounded-xl border transition-all ${
              justUpdated ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' : ''
            } ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Annual Income (₹)</span>
              <input
                type="number"
                value={applicantProfile.annual_income}
                onChange={(e) => setApplicantProfile({ ...applicantProfile, annual_income: Number(e.target.value) })}
                className="w-full bg-transparent text-xs font-bold text-amber-500 focus:outline-none mt-1"
              />
            </div>

            {/* Business Sector */}
            <div className={`p-3 rounded-xl border transition-all ${
              justUpdated ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' : ''
            } ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Business Sector</span>
              <select
                value={applicantProfile.business_type}
                onChange={(e) => setApplicantProfile({ ...applicantProfile, business_type: e.target.value })}
                className="w-full bg-transparent text-xs font-bold text-amber-500 focus:outline-none cursor-pointer mt-1"
              >
                <option value="Micro Enterprise" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Micro Enterprise</option>
                <option value="Dairy/Agri" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Dairy / Agriculture</option>
                <option value="Beauty Parlour" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Beauty Parlour</option>
                <option value="Tailoring" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Tailoring & Crafts</option>
                <option value="Transport" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Transport / Vehicle</option>
                <option value="E-Rickshaw" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Green Business / E-Rickshaw</option>
              </select>
            </div>

            {/* Requested Loan Amount */}
            <div className={`p-3 rounded-xl border transition-all ${
              justUpdated ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20' : ''
            } ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Loan Needed (₹)</span>
              <input
                type="number"
                value={applicantProfile.loan_amount_requested}
                onChange={(e) => setApplicantProfile({ ...applicantProfile, loan_amount_requested: Number(e.target.value) })}
                className="w-full bg-transparent text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none mt-1"
              />
            </div>

            {/* Location */}
            <div className={`p-3 rounded-xl border transition-all ${
              justUpdated ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' : ''
            } ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">State / District</span>
              <input
                type="text"
                value={`${applicantProfile.district}, ${applicantProfile.state}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setApplicantProfile({
                    ...applicantProfile,
                    district: parts[0] ? parts[0].trim() : applicantProfile.district,
                    state: parts[1] ? parts[1].trim() : applicantProfile.state
                  });
                }}
                className={`w-full bg-transparent text-xs font-bold focus:outline-none mt-1 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-bold text-sm hover:brightness-110 transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Processing Rule Engine...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.btnEvaluate}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <VoiceAgentOverlay
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscript={(text, extractedProfile) => {
          setInputText(text);
          if (extractedProfile && Object.keys(extractedProfile).length > 0) {
            setApplicantProfile(prev => ({ ...prev, ...extractedProfile }));
            triggerFieldHighlight();
          }
        }}
        theme={theme}
        t={t}
      />
    </div>
  );
}
