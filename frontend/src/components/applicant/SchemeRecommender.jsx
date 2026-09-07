import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, XCircle, Info, ChevronDown, ChevronUp, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

const SCHEME_TRANSLATIONS = {
  SCH_MSY: {
    en: { name: "Mahila Samriddhi Yojana (MSY)", desc: "Concessional micro-credit scheme specifically designed for Scheduled Caste women entrepreneurs for income generation." },
    hi: { name: "महिला समृद्धि योजना (MSY)", desc: "अनुसूचित जाति की महिला उद्यमियों के लिए आय सृजन हेतु रियायती माइक्रो-क्रेडिट योजना।" },
    bn: { name: "মহিলা সমৃদ্ধি যোজনা (MSY)", desc: "তফসিলি জাতির মহিলা উদ্যোক্তাদের জন্য আয় তৈরির উদ্দেশ্যে সুবিধাজনক ক্ষুদ্র ঋণ স্কিম।" },
    mr: { name: "महिला समृद्धी योजना (MSY)", desc: "अनुसूचित जातीच्या महिला उद्योजकांसाठी उत्पन्न निर्मितीसाठी सवलतीची मायक्रो-क्रेडिट योजना." },
    te: { name: "మహిళా సమృద్ధి యోజన (MSY)", desc: "ఎస్సీ మహిళా పారిశ్రామికవేత్తల ఆదాయ ఉత్పత్తి కోసం ప్రత్యేకంగా రూపొందించిన రాయితీ మైక్రో-క్రెడిట్ పథకం." },
    ta: { name: "மகிளா சம்ரித்தி யோஜனா (MSY)", desc: "பட்டியலின பெண் தொழில்முனைவோருக்காக வருமானம் ஈட்ட வடிவமைக்கப்பட்ட சலுகை நுண்கடன் திட்டம்." }
  },
  SCH_MCS: {
    en: { name: "Micro Credit Scheme (MCS)", desc: "Provides financial assistance for small business units, tiny trade, and self-employment projects for SC individuals." },
    hi: { name: "माइक्रो क्रेडिट योजना (MCS)", desc: "अनुसूचित जाति के व्यक्तियों के लिए छोटे व्यावसायिक इकाइयों, लघु व्यापार और स्व-रोजगार के लिए वित्तीय सहायता।" },
    bn: { name: "মাইক্রো ক্রেডিট স্কিম (MCS)", desc: "তফসিলি জাতির ব্যক্তিদের ক্ষুদ্র ব্যবসায়িক ইউনিট এবং স্ব-কর্মসংস্থানের জন্য আর্থিক সহায়তা।" },
    mr: { name: "मायक्रो क्रेडिट योजना (MCS)", desc: "अनुसूचित जातीच्या व्यक्तींसाठी लहान व्यवसाय युनिट आणि स्वयंरोजगारासाठी आर्थिक सहाय्य." },
    te: { name: "మైక్రో క్రెడిట్ స్కీమ్ (MCS)", desc: "చిన్న వ్యాపారాలు మరియు స్వయం ఉపాధి ప్రాజెక్ట్‌ల కోసం ఎస్సీ వ్యక్తులకు ఆర్థిక సహాయం." },
    ta: { name: "மைக்ரோ கிரெடிட் திட்டம் (MCS)", desc: "சிறு வணிக அலகுகள் மற்றும் சுயதொழில் திட்டங்களுக்காக பட்டியலின மக்களுக்கு நிதி உதவி வழங்குகிறது." }
  },
  SCH_TLS: {
    en: { name: "Term Loan Scheme (TLS)", desc: "Term loan assistance up to ₹15 Lakhs for viable income generating projects in transport, service, and manufacturing sectors." },
    hi: { name: "टर्म लोन योजना (TLS)", desc: "परिवहन, सेवा और विनिर्माण क्षेत्रों में व्यावहारिक आय अर्जक परियोजनाओं के लिए ₹15 लाख तक टर्म लोन सहायता।" },
    bn: { name: "টার্ম লোন স্কিম (TLS)", desc: "পরিবহন, পরিষেবা এবং উত্পাদন খাতে আয় তৈরির প্রকল্পের জন্য ₹১৫ লাখ পর্যন্ত মেয়াদী ঋণ।" },
    mr: { name: "टर्म लोन योजना (TLS)", desc: "वाहतूक, सेवा आणि उत्पादन क्षेत्रातील प्रकल्पांसाठी ₹१५ लाखांपर्यंत मुदत कर्ज सहाय्य." },
    te: { name: "టర్మ్ లోన్ స్కీమ్ (TLS)", desc: "రవాణా, సేవలు మరియు తయారీ రంగాలలో ప్రాజెక్ట్‌ల కోసం ₹15 లక్షల వరకు టర్మ్ లోన్ సహాయం." },
    ta: { name: "கால கடன் திட்டம் (TLS)", desc: "போக்குவரத்து, சேவை மற்றும் உற்பத்தித் துறைகளில் ₹15 லட்சம் வரை நீண்ட கால கடன் உதவி." }
  },
  SCH_MKY: {
    en: { name: "Mahila Kisan Yojana (MKY)", desc: "Concessional credit scheme for women farmers belonging to Scheduled Castes for agriculture and allied activities." },
    hi: { name: "महिला किसान योजना (MKY)", desc: "कृषि और संबद्ध गतिविधियों के लिए अनुसूचित जाति की महिला किसानों के लिए रियायती ऋण योजना।" },
    bn: { name: "মহিলা কিষাণ যোজনা (MKY)", desc: "কৃষি ও সংশ্লিষ্ট কাজের জন্য তফসিলি জাতির মহিলা কৃষকদের জন্য সুবিধাজনক ঋণ প্রকল্প।" },
    mr: { name: "महिला किसान योजना (MKY)", desc: "शेती आणि संबंधित कामांसाठी अनुसूचित जातीच्या महिला शेतकऱ्यांसाठी सवलतीची कर्ज योजना." },
    te: { name: "మహిళా కిసాన్ యోజన (MKY)", desc: "వ్యవసాయం మరియు అనుబంధ కార్యకలాపాల కోసం ఎస్సీ మహిళా రైతులకు రాయితీ రుణ పథకం." },
    ta: { name: "மகிளா கிசான் யோஜனா (MKY)", desc: "விவசாயம் மற்றும் அதுசார்ந்த பணிகளுக்காக பட்டியலின பெண் விவசாயிகளுக்கான சலுகைக் கடன் திட்டம்." }
  },
  SCH_GBS: {
    en: { name: "Green Business Scheme (GBS)", desc: "Financial support for eco-friendly business activities such as E-Rickshaws, Solar Energy units, and Waste Management." },
    hi: { name: "ग्रीन बिजनेस योजना (GBS)", desc: "ई-रिक्शा, सौर ऊर्जा इकाइयों और अपशिष्ट प्रबंधन जैसी पर्यावरण-अनुकूल व्यावसायिक गतिविधियों के लिए वित्तीय सहायता।" },
    bn: { name: "গ্রিন বিজনেস স্কিম (GBS)", desc: "ই-রিকশা, সৌর শক্তি এবং বর্জ্য ব্যবস্থাপনার মতো পরিবেশ-বান্ধব ব্যবসায়ের জন্য আর্থিক সহায়তা।" },
    mr: { name: "ग्रीन बिझनेस योजना (GBS)", desc: "ई-रिक्षा, सौर ऊर्जा आणि कचरा व्यवस्थापन यांसारख्या पर्यावरणपूरक व्यवसायांसाठी आर्थिक सहाय्य." },
    te: { name: "గ్రీన్ బిజినెస్ స్కీమ్ (GBS)", desc: "ఇ-రిక్షాలు, సౌర విద్యుత్ యూనిట్లు మరియు వ్యర్థాల నిర్వహణ వంటి పర్యావరణ అనుకూల వ్యాపారాలకు ఆర్థిక సహాయం." },
    ta: { name: "பசுமை வணிகத் திட்டம் (GBS)", desc: "இ-ரிக்ஷா, சூரிய சக்தி மற்றும் கழிவு மேலாண்மை போன்ற சூழல் நட்பு வணிகங்களுக்கான நிதி உதவி." }
  }
};

export default function SchemeRecommender() {
  const { recommendations, selectedScheme, setSelectedScheme, setCurrentStep, t, lang, theme, calculateEmi, applicantProfile, fetchPartners } = useApp();
  const [openAuditId, setOpenAuditId] = useState(null);

  const getSchemeDetails = (schemeId, fallbackEnName, fallbackEnDesc) => {
    const s = SCHEME_TRANSLATIONS[schemeId];
    if (s && s[lang]) return s[lang];
    if (s && s.en) return s.en;
    return { name: fallbackEnName, desc: fallbackEnDesc };
  };

  const handleSelectScheme = (rec) => {
    setSelectedScheme(rec.scheme);
    calculateEmi(rec.capped_loan_amount, rec.interest_rate_pa, rec.max_tenure_months, rec.moratorium_months, applicantProfile.annual_income / 12);
    fetchPartners(applicantProfile.state, applicantProfile.district, rec.scheme.id);
  };

  const handleProceedToEmi = (rec) => {
    handleSelectScheme(rec);
    setCurrentStep(3);
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={`glass-panel rounded-2xl p-8 text-center ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
        <Info className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <p>No evaluations loaded. Please complete the intake profile step first.</p>
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
            <Sparkles className="w-6 h-6 text-amber-500" />
            {t.matchingResults}
          </h2>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Evaluated against deterministic NSFDC concessional credit guidelines. 100% explainable & auditable.
          </p>
        </div>

        <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {recommendations.filter(r => r.is_eligible).length} Schemes Eligible
        </span>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec) => {
          const scheme = rec.scheme;
          const isSelected = selectedScheme?.id === scheme.id;
          const isEligible = rec.is_eligible;
          const details = getSchemeDetails(scheme.id, scheme.name_en, scheme.description_en);

          return (
            <div
              key={scheme.id}
              onClick={() => handleSelectScheme(rec)}
              className={`glass-card rounded-2xl p-6 transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? theme === 'light'
                    ? 'border-2 border-amber-500 bg-white shadow-xl shadow-amber-500/10'
                    : 'border-2 border-amber-500 bg-slate-900/90 shadow-xl shadow-amber-500/10'
                  : theme === 'light'
                  ? 'border border-slate-200 hover:border-slate-300'
                  : 'border border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header: Name + Code + Score */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-extrabold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                    NSFDC {scheme.code}
                  </span>
                  <h3 className={`text-lg font-bold font-outfit mt-1.5 leading-snug ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}>
                    {details.name}
                  </h3>
                </div>

                <div className="flex flex-col items-end">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                    isEligible
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    <span>{rec.match_score}% Match</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              }`}>
                {details.desc}
              </p>

              {/* Specs Pills */}
              <div className={`grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
              }`}>
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">Interest Rate</span>
                  <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 flex items-center">
                    {scheme.interest_rate_pa}% <span className="text-[9px] text-slate-400 font-normal ml-0.5">p.a.</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">Max Loan</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{(scheme.max_loan_amount / 100000).toFixed(1)}L
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">Moratorium</span>
                  <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400">
                    {scheme.moratorium_months} Months
                  </span>
                </div>
              </div>

              {/* Audit Explainability Accordion Button */}
              <div className={`pt-2 border-t flex items-center justify-between ${
                theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'
              }`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenAuditId(openAuditId === scheme.id ? null : scheme.id);
                  }}
                  className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.explainHeader}</span>
                  {openAuditId === scheme.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProceedToEmi(rec);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <span>{t.btnPlanEmi}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expandable Audit Log Drawer */}
              {openAuditId === scheme.id && (
                <div className={`mt-4 pt-4 border-t rounded-xl p-4 space-y-2 text-xs ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/90 border-slate-800'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Deterministic Rule Evaluation Log:
                  </span>
                  
                  {rec.passed_rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{lang === 'hi' ? rule.label_hi : rule.label_en}</span>
                    </div>
                  ))}

                  {rec.failed_rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-rose-600 dark:text-rose-400">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{lang === 'hi' ? rule.label_hi : rule.label_en}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
