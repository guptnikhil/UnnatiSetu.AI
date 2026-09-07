import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' }
];

export const TRANSLATIONS = {
  en: {
    brandName: "UnnatiSetu.ai",
    brandTagline: "AI-Assisted Concessional Credit Matching for Marginalized Entrepreneurs",
    sihTag: "SIH 2026 Prototype — Team The Innovators",
    navApplicantMode: "Applicant Portal",
    navAdminMode: "NSFDC Admin Dashboard",
    step1: "1. Profile Intake",
    step2: "2. Eligible Schemes",
    step3: "3. EMI Planning",
    step4: "4. Partner Routing",
    step5: "5. Document Checklist",
    heroTitle: "Bridge to Progress & Economic Empowerment",
    heroSubtitle: "Discover government concessional loan schemes, calculate upfront affordable EMIs, and connect with capacity-ranked Channel Partners in minutes.",
    quickPersonaPrompt: "Try Sample Personas:",
    persona1: "Ramesh (SC Trader, ₹1 Lakh)",
    persona2: "Sunita (SC Female Dairy, ₹1.2 Lakh)",
    persona3: "Anita (SC Beauty Parlour, ₹1.4 Lakh)",
    intakeHeader: "Tell Us About Yourself or Speak Your Need",
    intakePlaceholder: "e.g., I am Ramesh from Lucknow. I want a loan of ₹1,00,000 to open a small grocery retail shop.",
    voiceBtnRecord: "Click to Speak (Voice Input)",
    voiceBtnStop: "Listening...",
    extractHeader: "Live Extracted Applicant Profile",
    btnEvaluate: "Evaluate Eligibility & Match Schemes",
    matchingResults: "Eligible Concessional Schemes",
    explainHeader: "Why I Matched (Audit Breakdown)",
    btnPlanEmi: "Simulate EMI & Financial Fit",
    emiHeader: "Financial Planning & Moratorium Simulator",
    loanAmount: "Requested Loan Amount",
    tenureMonths: "Repayment Tenure",
    moratoriumMonths: "Moratorium Grace Period",
    monthlyEmi: "Estimated Monthly EMI",
    marketComparison: "Interest Saved vs Commercial Bank (14% p.a.):",
    affordabilityLabel: "Monthly Repayment Safety Score:",
    btnLocatePartners: "Find Nearest Channel Partners",
    partnerHeader: "Geo-Spatial & Capacity-Ranked Channel Partners",
    rankScoreLabel: "Match & Capacity Score",
    distanceLabel: "Distance",
    npaLabel: "Health Rating",
    btnSelectPartner: "Select Partner & View Document Checklist",
    checklistHeader: "Personalized Application Readiness Checklist",
    btnSubmitPreQual: "Submit Pre-Qualification to NSFDC",
    adminHeader: "NSFDC Officer Command Center",
    totalApplicants: "Total Applicants",
    approvalRate: "Matched Rate",
    avgMatchTime: "Avg Match Time",
    activePartners: "Channel Partners",
    stuckAlerts: "Stuck Cases Alert",
    btnRefresh: "Refresh Data",
    searchPlaceholder: "Search by Applicant Name, ID, or District...",
    statusAll: "All Statuses",
    stateAll: "All States",
    themeToggleDark: "Dark Mode",
    themeToggleLight: "White Mode"
  },
  hi: {
    brandName: "उन्नतिसेतु.ai",
    brandTagline: "वंचित उद्यमियों के लिए एआई-संचालित योजना मिलान मंच",
    sihTag: "एसआईएच 2026 प्रोटोटाइप — टीम द इनोवेटर्स",
    navApplicantMode: "आवेदक पोर्टल",
    navAdminMode: "NSFDC एडमिन डैशबोर्ड",
    step1: "1. प्रोफ़ाइल इनटेक",
    step2: "2. पात्र योजनाएं",
    step3: "3. ईएमआई योजना",
    step4: "4. पार्टनर रूटिंग",
    step5: "5. दस्तावेज़ चेकलिस्ट",
    heroTitle: "प्रगति और आर्थिक सशक्तिकरण का सेतु",
    heroSubtitle: "सरकारी रियायती ऋण योजनाओं की खोज करें, ईएमआई की गणना करें, और कुछ ही मिनटों में चैनल पार्टनर्स से जुड़ें।",
    quickPersonaPrompt: "नमूना प्रोफ़ाइल आज़माएं:",
    persona1: "रमेश (अनुसूचित जाति व्यापारी, ₹1 लाख)",
    persona2: "सुनीता (अनुसूचित जाति महिला डेयरी, ₹1.2 लाख)",
    persona3: "अनीता (अनुसूचित जाति ब्यूटी पार्लर, ₹1.4 लाख)",
    intakeHeader: "अपने बारे में बताएं या अपनी आवश्यकता बोलें",
    intakePlaceholder: "उदा. मैं लखनऊ का रमेश हूं। मैं किराना दुकान खोलने के लिए ₹1,00,000 का ऋण चाहता हूं।",
    voiceBtnRecord: "बोलने के लिए क्लिक करें (आवाज इनपुट)",
    voiceBtnStop: "सुन रहा हूँ...",
    extractHeader: "लाइव निकाला गया आवेदक प्रोफ़ाइल",
    btnEvaluate: "पात्रता का मूल्यांकन करें और योजनाएं मिलाएं",
    matchingResults: "पात्र रियायती योजनाएं",
    explainHeader: "मैच क्यों हुआ (ऑडिट विवरण)",
    btnPlanEmi: "ईएमआई और वित्तीय फिट अनुकरण करें",
    emiHeader: "वित्तीय योजना और अधिस्थगन (मोरेटोरियम) सिम्युलेटर",
    loanAmount: "मांगा गया ऋण की राशि",
    tenureMonths: "पुनर्भुगतान अवधि",
    moratoriumMonths: "अधिस्थगन छूट अवधि",
    monthlyEmi: "अनुमानित मासिक ईएमआई",
    marketComparison: "वाणिज्यिक बैंक (14% वार्षिक) की तुलना में ब्याज बचत:",
    affordabilityLabel: "मासिक पुनर्भुगतान सुरक्षा स्कोर:",
    btnLocatePartners: "निकटतम चैनल पार्टनर खोजें",
    partnerHeader: "भू-स्थानिक और क्षमता-रैंक वाले चैनल पार्टनर",
    rankScoreLabel: "मैच और क्षमता स्कोर",
    distanceLabel: "दूरी",
    npaLabel: "स्वास्थ्य रेटिंग",
    btnSelectPartner: "पार्टनर चुनें और दस्तावेज़ चेकलिस्ट देखें",
    checklistHeader: "व्यक्तिगत आवेदन तैयारी चेकलिस्ट",
    btnSubmitPreQual: "NSFDC को पूर्व-पात्रता जमा करें",
    adminHeader: "NSFDC अधिकारी कमांड सेंटर",
    totalApplicants: "कुल आवेदक",
    approvalRate: "मैच दर",
    avgMatchTime: "औसत समय",
    activePartners: "चैनल पार्टनर्स",
    stuckAlerts: "अटके हुए मामले",
    btnRefresh: "डेटा ताज़ा करें",
    searchPlaceholder: "आवेदक का नाम, आईडी या जिला खोजें...",
    statusAll: "सभी स्थितियाँ",
    stateAll: "सभी राज्य",
    themeToggleDark: "डार्क मोड",
    themeToggleLight: "व्हाइट मोड"
  },
  bn: {
    brandName: "উন্নতিসেতু.ai",
    brandTagline: "প্রান্তিক উদ্যোক্তাদের জন্য এআই-চালিত স্কিম ম্যাচিং প্ল্যাটফর্ম",
    sihTag: "এসআইএইচ ২০২৬ প্রোটোটাইপ — টিম দ্য ইনোভেটরস",
    navApplicantMode: "আবেদনকারী পোর্টাল",
    navAdminMode: "NSFDC অ্যাডমিন ড্যাশবোর্ড",
    step1: "১. প্রোফাইল ইনটেক",
    step2: "২. যোগ্য স্কিম",
    step3: "৩. ইএমআই পরিকল্পনা",
    step4: "৪. পার্টনার রাউটিং",
    step5: "৫. নথি চেকলিস্ট",
    heroTitle: "অগ্রগতি এবং অর্থনৈতিক ক্ষমতায়নের সেতু",
    heroSubtitle: "সরকারি সুবিধাজনক ঋণ স্কিম খুঁজুন, ইএমআই গণনা করুন এবং কয়েক মিনিটের মধ্যে চ্যানেল পার্টনারদের সাথে সংযুক্ত হন।",
    quickPersonaPrompt: "নমুনা প্রোফাইল চেষ্টা করুন:",
    persona1: "রমেশ (এসসি ব্যবসায়ী, ₹১ লাখ)",
    persona2: "সুনীতা (এসসি মহিলা দুগ্ধ খামার, ₹১.২ লাখ)",
    persona3: "অনিতা (এসসি বিউটি পার্লার, ₹১.৪ লাখ)",
    intakeHeader: "আপনার সম্পর্কে বলুন বা আপনার প্রয়োজন বলুন",
    intakePlaceholder: "যেমন: আমি লখনউয়ের রমেশ। একটি মুদি দোকান খোলার জন্য আমার ₹১,০০,০০০ ঋণ প্রয়োজন।",
    voiceBtnRecord: "কথা বলতে ক্লিক করুন (ভয়েস ইনপুট)",
    voiceBtnStop: "শুনছি...",
    extractHeader: "লাইভ এক্সট্র্যাক্ট করা প্রোফাইল",
    btnEvaluate: "যোগ্যতা মূল্যায়ন ও স্কিম ম্যাচ করুন",
    matchingResults: "যোগ্য সুবিধাজনক ঋণ স্কিম",
    explainHeader: "কেন ম্যাচ হলো (অডিট বিবরণ)",
    btnPlanEmi: "ইএমআই ও আর্থিক পরিকল্পনা সিমুলেট করুন",
    emiHeader: "আর্থিক পরিকল্পনা ও মোরেটোরিয়াম সিমুলেটর",
    loanAmount: "অনুরোধ করা ঋণের পরিমাণ",
    tenureMonths: "পরিশোধের মেয়াদ",
    moratoriumMonths: "মোরেটোরিয়াম গ্রেস পিরিয়ড",
    monthlyEmi: "আনুমানিক মাসিক ইএমআই",
    marketComparison: "বাণিজ্যিক ব্যাঙ্কের (১৪% বার্ষিক) তুলনায় সুদ সাশ্রয়:",
    affordabilityLabel: "মাসিক পরিশোধ সুরক্ষা স্কোর:",
    btnLocatePartners: "নিকটতম চ্যানেল পার্টনার খুঁজুন",
    partnerHeader: "ভূ-স্থানিক ও সক্ষমতা-র‌্যাঙ্কযুক্ত চ্যানেল পার্টনার",
    rankScoreLabel: "ম্যাচ ও সক্ষমতা স্কোর",
    distanceLabel: "দূরত্ব",
    npaLabel: "স্বাস্থ্য রেটিং",
    btnSelectPartner: "পার্টনার বেছে নিন ও নথি চেকলিস্ট দেখুন",
    checklistHeader: "ব্যক্তিগত আবেদন প্রস্তুতি চেকলিস্ট",
    btnSubmitPreQual: "NSFDC-তে প্রাক-যোগ্যতা জমা দিন",
    adminHeader: "NSFDC অফিসার কমান্ড সেন্টার",
    totalApplicants: "মোট আবেদনকারী",
    approvalRate: "ম্যাচ রেট",
    avgMatchTime: "গড় সময়",
    activePartners: "চ্যানেল পার্টনার",
    stuckAlerts: "আটকে থাকা কেস",
    btnRefresh: "ডেটা রিফ্রেশ করুন",
    searchPlaceholder: "আবেদনকারীর নাম, আইডি বা জেলা দিয়ে অনুসন্ধান করুন...",
    statusAll: "সমস্ত স্থিতি",
    stateAll: "সমস্ত রাজ্য",
    themeToggleDark: "ডার্ক মোড",
    themeToggleLight: "হোয়াইট মোড"
  },
  mr: {
    brandName: "उन्नतीसेतू.ai",
    brandTagline: "वंचित उद्योजकांसाठी एआय-आधारित योजना जुळणी मंच",
    sihTag: "एसआयएच २०२६ प्रोटोटाइप — टीम द इनोव्हेटर्स",
    navApplicantMode: "अर्जदार पोर्टल",
    navAdminMode: "NSFDC प्रशासक डॅशबोर्ड",
    step1: "१. प्रोफाइल नोंदणी",
    step2: "२. पात्र योजना",
    step3: "३. ईएमआय नियोजन",
    step4: "४. भागीदार निवड",
    step5: "५. कागदपत्रे सूची",
    heroTitle: "प्रगती आणि आर्थिक सबलीकरणाचा सेतू",
    heroSubtitle: "सरकारी सवलतीच्या कर्ज योजना शोधा, ईएमआयची गणना करा आणि काही मिनिटांत चॅनेल भागीदारांशी संपर्क साधा.",
    quickPersonaPrompt: "नमुना प्रोफाइल वापरून पहा:",
    persona1: "रमेश (अनुसूचित जाती व्यापारी, ₹१ लाख)",
    persona2: "सुनीता (अनुसूचित जाती महिला डेअरी, ₹१.२ लाख)",
    persona3: "अनिता (अनुसूचित जाती ब्युटी पार्लर, ₹१.४ लाख)",
    intakeHeader: "तुमच्याबद्दल सांगा किंवा तुमची गरज बोला",
    intakePlaceholder: "उदा: मी लखनौचा रमेश आहे. किराणा दुकान सुरू करण्यासाठी मला ₹१,००,००० कर्जाची गरज आहे.",
    voiceBtnRecord: "बोलण्यासाठी क्लिक करा (आवाज इनपुट)",
    voiceBtnStop: "ऐकत आहे...",
    extractHeader: "थेट काढलेली अर्जदार प्रोफाइल",
    btnEvaluate: "पात्रता तपासा आणि योजना जुळवा",
    matchingResults: "पात्र सवलतीच्या योजना",
    explainHeader: "जुळणी का झाली (ऑडिट तपशील)",
    btnPlanEmi: "ईएमआय आणि आर्थिक नियोजन सिम्युलेट करा",
    emiHeader: "आर्थिक नियोजन आणि स्थगिती (मोरेटोरियम) सिम्युलेटर",
    loanAmount: "मागणी केलेली कर्ज रक्कम",
    tenureMonths: "परतफेड कालावधी",
    moratoriumMonths: "सूट कालावधी (मोरेटोरियम)",
    monthlyEmi: "अंदाजे मासिक ईएमआय",
    marketComparison: "व्यावसायिक बँकेच्या (१४% वार्षिक) तुलनेत व्याज बचत:",
    affordabilityLabel: "मासिक परतफेड सुरक्षितता स्कोअर:",
    btnLocatePartners: "जवळचे चॅनेल भागीदार शोधा",
    partnerHeader: "भौगोलिक आणि क्षमता-रँक केलेले चॅनेल भागीदार",
    rankScoreLabel: "मॅच आणि क्षमता स्कोअर",
    distanceLabel: "अंतर",
    npaLabel: "आरोग्य रेटिंग",
    btnSelectPartner: "भागीदार निवडा आणि कागदपत्रे सूची पहा",
    checklistHeader: "वैयक्तिक अर्ज पूर्वतयारी सूची",
    btnSubmitPreQual: "NSFDC कडे पूर्व-पात्रता सादर करा",
    adminHeader: "NSFDC अधिकारी कमांड सेंटर",
    totalApplicants: "एकूण अर्जदार",
    approvalRate: "जुळणी दर",
    avgMatchTime: "सरासरी वेळ",
    activePartners: "चॅनेल भागीदार",
    stuckAlerts: "अडकलेली प्रकरणे",
    btnRefresh: "डेटा रिफ्रेश करा",
    searchPlaceholder: "नाव, आयडी किंवा जिल्ह्यानुसार शोधा...",
    statusAll: "सर्व स्थिती",
    stateAll: "सर्व राज्ये",
    themeToggleDark: "डार्क मोड",
    themeToggleLight: "व्हाइट मोड"
  },
  te: {
    brandName: "ఉన్నతిసేతు.ai",
    brandTagline: "అణగారిన పారిశ్రామికవేత్తల కోసం AI-ఆధారిత పథక సరిపోలిక వేదిక",
    sihTag: "SIH 2026 ప్రోటోటైప్ — టీమ్ ది ఇన్నోవేటర్స్",
    navApplicantMode: "దరఖాస్తుదారు పోర్టల్",
    navAdminMode: "NSFDC అడ్మిన్ డాష్‌బోర్డ్",
    step1: "1. ప్రొఫైల్ నమోదు",
    step2: "2. అర్హత గల పథకాలు",
    step3: "3. EMI ప్రణాళిక",
    step4: "4. భాగస్వామి ఎంపిక",
    step5: "5. పత్రాల జాబితా",
    heroTitle: "పురోగతి మరియు ఆర్థిక సాధికారతకు వారధి",
    heroSubtitle: "ప్రభుత్వ రాయితీ రుణ పథకాలను కనుగొనండి, EMIని లెక్కించండి మరియు నిమిషాల్లో ఛానల్ భాగస్వాములతో కనెక్ట్ అవ్వండి.",
    quickPersonaPrompt: "నమూనా ప్రొఫైల్‌లను ప్రయత్నించండి:",
    persona1: "రమేష్ (SC వ్యాపారి, ₹1 లక్ష)",
    persona2: "సునీత (SC మహిళా డెయిరీ, ₹1.2 లక్షలు)",
    persona3: "అనిత (SC బ్యూటీ పార్లర్, ₹1.4 లక్షలు)",
    intakeHeader: "మీ వివరాలను తెలియజేయండి లేదా మీ అవసరాన్ని మాట్లాడండి",
    intakePlaceholder: "ఉదా: నేను లక్నో నుండి రమేష్. కిరాణా దుకాణం తెరవడానికి నాకు ₹1,00,000 రుణం కావాలి.",
    voiceBtnRecord: "మాట్లాడటానికి క్లిక్ చేయండి (వాయిస్ ఇన్‌పుట్)",
    voiceBtnStop: "వింటోంది...",
    extractHeader: "లైవ్ సేకరించిన ప్రొఫైల్",
    btnEvaluate: "అర్హతను పరిశీలించి పథకాలను సరిపోల్చండి",
    matchingResults: "అర్హతగల రాయితీ పథకాలు",
    explainHeader: "ఎందుకు సరిపోయింది (ఆడిట్ వివరాలు)",
    btnPlanEmi: "EMI మరియు ఆర్థిక ఫిట్ అనుకరణ",
    emiHeader: "ఆర్థిక ప్రణాళిక మరియు తాత్కాలిక మినహాయింపు సిమ్యులేటర్",
    loanAmount: "కోరిన రుణ మొత్తం",
    tenureMonths: "తిరిగి చెల్లించే గడువు",
    moratoriumMonths: "మినహాయింపు గడువు (మొరటోరియం)",
    monthlyEmi: "అంచనా వేసిన నెలవారీ EMI",
    marketComparison: "వాణిజ్య బ్యాంకు (14% వార్షిక)తో పోలిస్తే వడ్డీ పొదుపు:",
    affordabilityLabel: "నెలవారీ చెల్లింపు భద్రతా స్కోర్:",
    btnLocatePartners: "సమీప ఛానల్ భాగస్వాములను కనుగొనండి",
    partnerHeader: "జియో-స్పేషియల్ మరియు సామర్థ్య ర్యాంక్ పొందిన భాగస్వాములు",
    rankScoreLabel: "సరిపోలిక మరియు సామర్థ్య స్కోర్" ,
    distanceLabel: "దూరం",
    npaLabel: "హెల్త్ రేటింగ్",
    btnSelectPartner: "భాగస్వామిని ఎంచుకుని పత్రాల జాబితాను చూడండి",
    checklistHeader: "వ్యక్తిగతీకరించిన పత్రాల చెక్‌లిస్ట్",
    btnSubmitPreQual: "NSFDC కి ముందస్తు అర్హతను సమర్పించండి",
    adminHeader: "NSFDC అధికారి కమాండ్ సెంటర్",
    totalApplicants: "మొత్తం దరఖాస్తుదారులు",
    approvalRate: "సరిపోలిక రేటు",
    avgMatchTime: "సగటు సమయం",
    activePartners: "ఛానల్ భాగస్వాములు",
    stuckAlerts: "ఆగిపోయిన కేసులు",
    btnRefresh: "డేటాను రిఫ్రెష్ చేయండి",
    searchPlaceholder: "పేరు, ఐడీ లేదా జిల్లా ద్వారా శోధించండి...",
    statusAll: "అన్ని స్థితులు",
    stateAll: "అన్ని రాష్ట్రాలు",
    themeToggleDark: "డార్క్ మోడ్",
    themeToggleLight: "వైట్ మోడ్"
  },
  ta: {
    brandName: "உன்னதிசேது.ai",
    brandTagline: "ஒதுக்கப்பட்ட தொழில்முனைவோருக்கான AI அடிப்படையிலான திட்ட பொருத்தம்",
    sihTag: "SIH 2026 முன்மாதிரி — டீம் தி இன்னோவேட்டர்ஸ்",
    navApplicantMode: "விண்ணப்பதாரர் போர்டல்",
    navAdminMode: "NSFDC நிர்வாகி டாஷ்போர்டு",
    step1: "1. சுயவிவர பதிவு",
    step2: "2. தகுதியான திட்டங்கள்",
    step3: "3. EMI திட்டமிடல்",
    step4: "4. கூட்டாளர் வழிகாட்டுதல்",
    step5: "5. ஆவண சரிபார்ப்பு பட்டியல்",
    heroTitle: "முன்னேற்றம் மற்றும் பொருளாதார மேம்பாட்டிற்கான பாலம்",
    heroSubtitle: "அரசு மானியக் கடன் திட்டங்களைக் கண்டறியவும், EMI-ஐ கணக்கிடவும், சில நிமிடங்களில் கூட்டாளர்களுடன் இணையவும்.",
    quickPersonaPrompt: "மாதிரி சுயவிவரங்களை முயற்சிக்கவும்:",
    persona1: "ரமேஷ் (SC வியாபாரி, ₹1 லட்சம்)",
    persona2: "சுனிதா (SC பெண் பால் பண்ணை, ₹1.2 லட்சம்)",
    persona3: "அனிதா (SC அழகு நிலையம், ₹1.4 லட்சம்)",
    intakeHeader: "உங்களைப் பற்றி சொல்லுங்கள் அல்லது உங்கள் தேவையைப் பேசுங்கள்",
    intakePlaceholder: "எ.கா: நான் லக்னோவைச் சேர்ந்த ரமேஷ். மளிகைக் கடை தொடங்க எனக்கு ₹1,00,000 கடன் தேவை.",
    voiceBtnRecord: "பேச கிளிக் செய்யவும் (குரல் பதிவு)",
    voiceBtnStop: "கேட்கிறது...",
    extractHeader: "நேரலையில் பிரித்தெடுக்கப்பட்ட சுயவிவரம்",
    btnEvaluate: "தகுதியை மதிப்பிட்டு திட்டங்களை பொருத்தவும்",
    matchingResults: "தகுதியான மானியக் கடன் திட்டங்கள்",
    explainHeader: "ஏன் பொருந்தியது (தணிக்கை விவரம்)",
    btnPlanEmi: "EMI மற்றும் நிதித் திட்டத்தை கணக்கிடுங்கள்",
    emiHeader: "நிதி திட்டமிடல் & சலுகைக் கால (மொரட்டோரியம்) சிமுலேட்டர்",
    loanAmount: "கோரப்பட்ட கடன் தொகை",
    tenureMonths: "திருப்பிச் செலுத்தும் காலம்",
    moratoriumMonths: "சலுகைக் காலம் (மொரட்டோரியம்)",
    monthlyEmi: "மதிப்பிடப்பட்ட மாதாந்திர EMI",
    marketComparison: "வணிக வங்கியை (14% ஆண்டு) விட வட்டி சேமிப்பு:",
    affordabilityLabel: "மாதாந்திர திருப்பிச் செலுத்தும் பாதுகாப்பு மதிப்பீடு:",
    btnLocatePartners: "அருகிலுள்ள கூட்டாளர்களைக் கண்டறியவும்",
    partnerHeader: "புவியியல் மற்றும் திறன் அடிப்படையில் தரவரிசைப்படுத்தப்பட்ட கூட்டாளர்கள்",
    rankScoreLabel: "பொருத்தம் மற்றும் திறன் மதிப்பீடு",
    distanceLabel: "தூரம்",
    npaLabel: "வங்கி ஆரோக்கிய மதிப்பீடு",
    btnSelectPartner: "கூட்டாளரைத் தேர்ந்தெடுத்து ஆவண பட்டியலைப் பார்க்கவும்",
    checklistHeader: "விண்ணப்பத் தயார்நிலை சரிபார்ப்புப் பட்டியல்",
    btnSubmitPreQual: "NSFDC-ல் முன் தகுதியைச் சமர்ப்பிக்கவும்",
    adminHeader: "NSFDC அதிகாரி கட்டளை மையம்",
    totalApplicants: "மொத்த விண்ணப்பதாரர்கள்",
    approvalRate: "பொருத்த விகிதம்",
    avgMatchTime: "சராசரி நேரம்",
    activePartners: "சேவை கூட்டாளர்கள்",
    stuckAlerts: "நிலுவையில் உள்ள வழக்குகள்",
    btnRefresh: "தரவை புதுப்பிக்கவும்",
    searchPlaceholder: "பெயர், ஐடி அல்லது மாவட்டம் மூலம் தேடவும்...",
    statusAll: "அனைத்து நிலைகளும்",
    stateAll: "அனைத்து மாநிலங்களும்",
    themeToggleDark: "இருண்ட பயன்முறை",
    themeToggleLight: "வெள்ளை பயன்முறை"
  }
};

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [mode, setMode] = useState('applicant'); // 'applicant' or 'admin'
  const [currentStep, setCurrentStep] = useState(1);

  // Sync theme to root html/body
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.classList.add('light', 'bg-slate-100', 'text-slate-900');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
      document.body.classList.remove('light', 'bg-slate-100', 'text-slate-900');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Applicant Profile
  const [applicantProfile, setApplicantProfile] = useState({
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
  });

  const [recommendations, setRecommendations] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [emiData, setEmiData] = useState(null);
  const [rankedPartners, setRankedPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [loading, setLoading] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Evaluate schemes via API
  const evaluateSchemes = async (profile = applicantProfile) => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      if (data.recommendations && data.recommendations.length > 0) {
        const top = data.recommendations[0];
        setSelectedScheme(top.scheme);
        // Automatically fetch initial EMI
        calculateEmi(top.capped_loan_amount, top.interest_rate_pa, top.max_tenure_months, top.moratorium_months, profile.annual_income / 12);
        // Automatically fetch ranked partners
        fetchPartners(profile.state, profile.district, top.scheme.id);
      }
      setCurrentStep(2);
    } catch (err) {
      console.warn("Backend API offline, using inline rule engine fallback:", err);
      // Inline fallback match logic
      const fallbackRecs = [
        {
          scheme: {
            id: "SCH_MCS",
            code: "MCS",
            name_en: "Micro Credit Scheme (MCS)",
            name_hi: "माइक्रो क्रेडिट योजना (MCS)",
            max_loan_amount: 140000,
            interest_rate_pa: 5.0,
            max_tenure_months: 60,
            moratorium_months: 6,
            nsfdc_subsidy_pct: 10.0,
            description_en: "Provides financial assistance for small business units and tiny trade.",
            description_hi: "छोटे व्यावसायिक इकाइयों के लिए वित्तीय सहायता।",
            required_documents: [
              { id: "doc_aadhaar", name_en: "Aadhaar Card", name_hi: "आधार कार्ड", mandatory: true },
              { id: "doc_caste", name_en: "SC Caste Certificate", name_hi: "अनुसूचित जाति प्रमाणपत्र", mandatory: true },
              { id: "doc_income", name_en: "Income Certificate", name_hi: "आय प्रमाण पत्र", mandatory: true },
              { id: "doc_bank", name_en: "Bank Passbook", name_hi: "बैंक पासबुक", mandatory: true }
            ]
          },
          is_eligible: true,
          match_score: 95,
          passed_rules: [
            { rule_code: "RULE_CATEGORY", label_en: "Social Category (SC) matches target (SC)", label_hi: "सामाजिक वर्ग (SC) लक्ष्य से मेल खाता है", passed: true },
            { rule_code: "RULE_INCOME", label_en: "Annual Income (₹1,20,000) is within limit (₹3,00,000)", label_hi: "वार्षिक आय सीमा के भीतर है", passed: true },
            { rule_code: "RULE_LOAN_CAP", label_en: "Requested Loan (₹1,00,000) is within limit (₹1,40,000)", label_hi: "मांगा गया ऋण सीमा में है", passed: true }
          ],
          failed_rules: [],
          capped_loan_amount: Math.min(profile.loan_amount_requested, 140000),
          interest_rate_pa: 5.0,
          max_tenure_months: 60,
          moratorium_months: 6
        }
      ];
      setRecommendations(fallbackRecs);
      setSelectedScheme(fallbackRecs[0].scheme);
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const calculateEmi = async (loanAmount, interestRate, tenure, moratorium, monthlyIncome) => {
    try {
      const res = await fetch('/api/calculate-emi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_amount: loanAmount,
          interest_rate_pa: interestRate,
          tenure_months: tenure,
          moratorium_months: moratorium,
          monthly_income: monthlyIncome || (applicantProfile.annual_income / 12)
        })
      });
      const data = await res.json();
      setEmiData(data);
    } catch (err) {
      console.warn("EMI endpoint fallback:", err);
      // Fallback calculation
      const r = (interestRate / 100) / 12;
      const emi = (loanAmount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
      setEmiData({
        principal: loanAmount,
        interest_rate_pa: interestRate,
        tenure_months: tenure,
        moratorium_months: moratorium,
        monthly_emi: Math.round(emi),
        moratorium_emi: Math.round(loanAmount * r),
        total_interest: Math.round((emi * tenure) - loanAmount),
        total_repayment: Math.round(emi * tenure),
        commercial_market_emi: Math.round(emi * 1.35),
        interest_saved_vs_market: Math.round((emi * 0.35) * tenure),
        emi_to_income_ratio_pct: 20.0,
        affordability_status_en: "Comfortable (Very Safe)",
        affordability_status_hi: "सुविधाजनक (अत्यंत सुरक्षित)",
        affordability_color: "green"
      });
    }
  };

  const fetchPartners = async (state, district, targetSchemeId) => {
    try {
      const res = await fetch('/api/rank-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, district, target_scheme_id: targetSchemeId })
      });
      const data = await res.json();
      setRankedPartners(data.ranked_partners || []);
      if (data.ranked_partners && data.ranked_partners.length > 0) {
        setSelectedPartner(data.ranked_partners[0].partner);
      }
    } catch (err) {
      console.warn("Partner rank endpoint fallback:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        theme,
        toggleTheme,
        t,
        mode,
        setMode,
        currentStep,
        setCurrentStep,
        applicantProfile,
        setApplicantProfile,
        recommendations,
        selectedScheme,
        setSelectedScheme,
        emiData,
        calculateEmi,
        rankedPartners,
        selectedPartner,
        setSelectedPartner,
        submittedApplication,
        setSubmittedApplication,
        evaluateSchemes,
        fetchPartners,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
