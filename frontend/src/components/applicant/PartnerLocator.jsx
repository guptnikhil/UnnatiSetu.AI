import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Building2, Phone, CheckCircle2, ShieldCheck, Clock, ArrowRight, Activity } from 'lucide-react';

export default function PartnerLocator() {
  const { rankedPartners, selectedPartner, setSelectedPartner, setCurrentStep, t, lang, theme, selectedScheme } = useApp();

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setCurrentStep(5);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-extrabold font-outfit flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            <Building2 className="w-6 h-6 text-amber-500" />
            {t.partnerHeader}
          </h2>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Partners ranked on <span className="text-amber-600 dark:text-amber-400 font-bold">Eligibility Fit</span>, <span className="text-emerald-600 dark:text-emerald-400 font-bold">Processing Capacity</span>, and <span className="text-sky-600 dark:text-sky-400 font-bold">Geo Proximity</span> (not just distance).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Ranked Partner List */}
        <div className="lg:col-span-7 space-y-4">
          {rankedPartners.map((item, idx) => {
            const partner = item.partner;
            const isSelected = selectedPartner?.id === partner.id;

            return (
              <div
                key={partner.id}
                onClick={() => setSelectedPartner(partner)}
                className={`glass-card rounded-2xl p-5 transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? theme === 'light'
                      ? 'border-2 border-amber-500 bg-white shadow-xl shadow-amber-500/10'
                      : 'border-2 border-amber-500 bg-slate-900 shadow-xl shadow-amber-500/10'
                    : theme === 'light'
                    ? 'border border-slate-200 hover:border-slate-300'
                    : 'border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                      Rank #{idx + 1} Candidate
                    </span>
                    <span className={`text-[10px] font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {partner.type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{item.rank_score}/100 Score</span>
                  </div>
                </div>

                {/* Name & Address */}
                <h3 className={`text-base font-bold font-outfit mb-1 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {partner.name}
                </h3>
                <p className={`text-xs flex items-start gap-1 mb-3 ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{partner.address}</span>
                </p>

                {/* Specs Pill Grid */}
                <div className={`grid grid-cols-3 gap-2 mb-3 p-2.5 rounded-xl border text-xs ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Capacity / Load</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {lang === 'hi' ? partner.capacity_label_hi : partner.capacity_label_en}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Proximity</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {item.distance_km} km away
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Avg Turnaround</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      ~{partner.avg_turnaround_days} Days
                    </span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className={`flex items-center justify-between pt-2 border-t ${
                  theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'
                }`}>
                  <span className={`text-xs flex items-center gap-1 font-mono ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {partner.contact_phone}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPartner(partner);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : theme === 'light'
                        ? 'bg-slate-100 text-slate-800 hover:bg-amber-500 hover:text-slate-950'
                        : 'bg-slate-800 text-slate-200 hover:bg-amber-500 hover:text-slate-950'
                    }`}
                  >
                    <span>{t.btnSelectPartner}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Geo Map Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`glass-panel rounded-2xl p-5 border space-y-4 sticky top-24 ${
            theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800'
          }`}>
            <h3 className={`text-sm font-bold font-outfit flex items-center gap-2 ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              <MapPin className="w-4 h-4 text-amber-500" />
              Geo-Spatial Regional Distribution
            </h3>

            {/* Visual Simulated Map Graphic */}
            <div className={`relative w-full h-64 rounded-xl overflow-hidden border flex items-center justify-center p-4 ${
              theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Map Pins Visualization */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                <div className={`border p-2.5 rounded-lg text-[11px] ${
                  theme === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900/90 border-slate-700/80 text-slate-300'
                }`}>
                  📍 Regional Focus: <span className="font-bold text-amber-600 dark:text-amber-400">Uttar Pradesh / State SCA Hub</span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-auto">
                  {rankedPartners.slice(0, 4).map((p, i) => (
                    <div
                      key={p.partner.id}
                      onClick={() => setSelectedPartner(p.partner)}
                      className={`p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                        selectedPartner?.id === p.partner.id
                          ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300'
                          : theme === 'light'
                          ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold truncate">{p.partner.name}</div>
                      <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {p.distance_km} km • Score {p.rank_score}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`text-[10px] text-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                  * Dynamic Leaflet / OpenStreetMap Geo Coordinates Enabled
                </div>
              </div>
            </div>

            {selectedPartner && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="text-amber-600 dark:text-amber-400 font-bold">Selected Channel Partner:</div>
                <div className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{selectedPartner.name}</div>
                <div className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>{selectedPartner.address}</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedPartner.capacity_label_en}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
