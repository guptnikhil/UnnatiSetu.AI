import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, ShieldCheck, TrendingDown, Clock, ArrowRight, HelpCircle, AlertTriangle } from 'lucide-react';

export default function EMICalculator() {
  const { selectedScheme, emiData, calculateEmi, setCurrentStep, t, lang, theme, applicantProfile } = useApp();

  const [loanAmount, setLoanAmount] = useState(100000);
  const [tenureMonths, setTenureMonths] = useState(60);
  const [moratoriumMonths, setMoratoriumMonths] = useState(6);

  useEffect(() => {
    if (selectedScheme) {
      const initialLoan = Math.min(applicantProfile.loan_amount_requested || 100000, selectedScheme.max_loan_amount);
      setLoanAmount(initialLoan);
      setTenureMonths(selectedScheme.max_tenure_months || 60);
      setMoratoriumMonths(selectedScheme.moratorium_months || 6);
      calculateEmi(initialLoan, selectedScheme.interest_rate_pa, selectedScheme.max_tenure_months || 60, selectedScheme.moratorium_months || 6, applicantProfile.annual_income / 12);
    }
  }, [selectedScheme]);

  const handleSliderChange = (amount, tenure, moro) => {
    setLoanAmount(amount);
    setTenureMonths(tenure);
    setMoratoriumMonths(moro);
    calculateEmi(amount, selectedScheme ? selectedScheme.interest_rate_pa : 5.0, tenure, moro, applicantProfile.annual_income / 12);
  };

  if (!selectedScheme) {
    return (
      <div className={`glass-panel rounded-2xl p-8 text-center ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
        <Calculator className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <p>Please select an eligible scheme first to run the EMI simulator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-extrabold font-outfit flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            <Calculator className="w-6 h-6 text-amber-500" />
            {t.emiHeader}
          </h2>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Simulating for <span className="text-amber-600 dark:text-amber-400 font-bold">{selectedScheme.name_en}</span> at <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedScheme.interest_rate_pa}% p.a.</span> concessional interest.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Sliders */}
        <div className={`lg:col-span-7 glass-panel rounded-2xl p-6 border space-y-6 ${
          theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800'
        }`}>
          
          {/* Loan Amount Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {t.loanAmount}
              </label>
              <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 font-outfit">
                ₹{loanAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={selectedScheme.max_loan_amount}
              step={5000}
              value={loanAmount}
              onChange={(e) => handleSliderChange(Number(e.target.value), tenureMonths, moratoriumMonths)}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500 ${
                theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            />
            <div className={`flex justify-between text-[10px] mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>Min ₹10,000</span>
              <span>Max Cap ₹{selectedScheme.max_loan_amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {t.tenureMonths}
              </label>
              <span className="text-base font-extrabold text-sky-600 dark:text-sky-400 font-outfit">
                {tenureMonths} Months ({(tenureMonths/12).toFixed(1)} Yrs)
              </span>
            </div>
            <input
              type="range"
              min={12}
              max={selectedScheme.max_tenure_months || 120}
              step={6}
              value={tenureMonths}
              onChange={(e) => handleSliderChange(loanAmount, Number(e.target.value), moratoriumMonths)}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-sky-500 ${
                theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            />
          </div>

          {/* Moratorium Grace Period Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {t.moratoriumMonths}
              </label>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-outfit">
                {moratoriumMonths} Months Grace
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={moratoriumMonths}
              onChange={(e) => handleSliderChange(loanAmount, tenureMonths, Number(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500 ${
                theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            />
            <p className={`text-[11px] mt-2 p-2.5 rounded-lg border ${
              theme === 'light' ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}>
              💡 During the moratorium grace period, you pay reduced token interest while your business starts generating income.
            </p>
          </div>
        </div>

        {/* Right Column: Calculated Results & Savings */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main EMI Card */}
          <div className={`glass-panel rounded-2xl p-6 border relative overflow-hidden shadow-2xl ${
            theme === 'light'
              ? 'border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-slate-200'
              : 'border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {t.monthlyEmi}
            </span>
            
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-outfit mb-3">
              ₹{emiData ? emiData.monthly_emi.toLocaleString('en-IN') : '0'} <span className="text-xs font-normal text-slate-500">/ month</span>
            </div>

            {moratoriumMonths > 0 && emiData && (
              <div className={`text-xs font-medium mb-4 p-2.5 rounded-xl border ${
                theme === 'light' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                During 6-month moratorium: Pay only <span className="font-bold">₹{emiData.moratorium_emi.toLocaleString('en-IN')} / month</span>
              </div>
            )}

            {/* Savings Banner */}
            {emiData && (
              <div className={`p-3.5 rounded-xl border flex items-center space-x-3 mb-4 ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                  : 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/30'
              }`}>
                <TrendingDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className={`text-[10px] block font-semibold ${
                    theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {t.marketComparison}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    Save ₹{emiData.interest_saved_vs_market.toLocaleString('en-IN')}!
                  </span>
                </div>
              </div>
            )}

            {/* Affordability Ratio */}
            {emiData && (
              <div className={`pt-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{t.affordabilityLabel}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {lang === 'hi' ? emiData.affordability_status_hi : emiData.affordability_status_en}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${
                      emiData.affordability_color === 'green' ? 'bg-emerald-500' : emiData.affordability_color === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, emiData.emi_to_income_ratio_pct * 2)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CTA Next Step */}
          <button
            onClick={() => setCurrentStep(4)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-bold text-sm hover:brightness-110 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{t.btnLocatePartners}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
