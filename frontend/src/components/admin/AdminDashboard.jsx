import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/SupabaseAuthContext';
import { Users, CheckCircle, Clock, Building2, AlertTriangle, Search, RefreshCw, Layers, Languages, ChevronDown, ChevronUp, LogOut, UserCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { apiUrl } from '../../services/api';
import { translateText } from '../../services/sarvam';

/**
 * TranslatedCell — shows an applicant's original free-text input with an
 * inline "Translate" toggle that fetches an English version via Sarvam.
 * The original is always preserved and shown on toggle — never discarded.
 */
function TranslatedCell({ originalText, theme }) {
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  if (!originalText) return null;

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }
    if (!translatedText) {
      setIsTranslating(true);
      const result = await translateText(originalText, 'en-IN');
      setTranslatedText(result.success ? result.translated_text : originalText);
      setIsTranslating(false);
    }
    setShowTranslated(true);
  };

  return (
    <div className="space-y-1">
      <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
        {showTranslated ? translatedText : originalText}
      </p>
      <button
        onClick={handleToggle}
        disabled={isTranslating}
        className={`flex items-center gap-1 text-[10px] font-semibold transition-colors ${
          theme === 'light'
            ? 'text-amber-700 hover:text-amber-900'
            : 'text-amber-400 hover:text-amber-300'
        }`}
      >
        <Languages className="w-3 h-3" />
        {isTranslating
          ? 'Translating…'
          : showTranslated
          ? 'Show Original'
          : 'View in English'}
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const { t, lang, theme } = useApp();
  const { adminProfile, signOut, isSupabaseConfigured, session } = useAuth();
  const INITIAL_METRICS = {
    total_applicants: 148,
    status_breakdown: { "Matched": 62, "Disbursed": 40, "Under Review": 24, "Pending Docs": 15, "New": 7 },
    scheme_uptake: { "Mahila Samriddhi (MSY)": 58, "Micro Credit (MCS)": 45, "Term Loan (TLS)": 28, "Mahila Kisan (MKY)": 17 },
    state_distribution: { "Uttar Pradesh": 52, "Bihar": 34, "Maharashtra": 26, "Delhi": 20, "Madhya Pradesh": 16 },
    total_requested_capital_inr: 18400000,
    avg_match_time_seconds: 1.4,
    stuck_cases_count: 3,
    active_channel_partners_count: 6
  };

  const INITIAL_APPLICANTS = [
    { id: "APP-2026-8801", name: "Ramesh Kumar", gender: "Male", category: "SC", annual_income: 120000, state: "Uttar Pradesh", district: "Lucknow", business_type: "Micro Enterprise", loan_amount_requested: 100000, matched_scheme_id: "SCH_MCS", matched_partner_id: "CP_UP_SCA_01", status: "Matched", stuck_alert: false, intake_transcript: "I am Ramesh from Lucknow. I want a loan of ₹1,00,000 to open a small grocery retail shop." },
    { id: "APP-2026-8802", name: "Sunita Devi", gender: "Female", category: "SC", annual_income: 95000, state: "Bihar", district: "Patna", business_type: "Dairy/Agri", loan_amount_requested: 120000, matched_scheme_id: "SCH_MSY", matched_partner_id: "CP_BH_SCA_01", status: "Pending Docs", stuck_alert: true, intake_transcript: "मैं सुनीता देवी, अनुसूचित जाति महिला किसान हूँ। मुझे डेयरी फार्म के लिए ₹1,20,000 का लोन चाहिए।" },
    { id: "APP-2026-8803", name: "Anita Rani", gender: "Female", category: "SC", annual_income: 150000, state: "Delhi", district: "Central Delhi", business_type: "Beauty Parlour", loan_amount_requested: 140000, matched_scheme_id: "SCH_MSY", matched_partner_id: "CP_DL_SBI_01", status: "Disbursed", stuck_alert: false, intake_transcript: "I am Anita Rani from Delhi. I want a loan of ₹1,40,000 for my beauty parlour." },
    { id: "APP-2026-8804", name: "Rajesh Sonkar", gender: "Male", category: "SC", annual_income: 210000, state: "Uttar Pradesh", district: "Varanasi", business_type: "Transport", loan_amount_requested: 500000, matched_scheme_id: "SCH_TLS", matched_partner_id: "CP_UP_PNB_02", status: "Under Review", stuck_alert: false, intake_transcript: "I am Rajesh Sonkar. I need ₹5 lakh loan for transport business in Varanasi." },
    { id: "APP-2026-8805", name: "Pooja Valmiki", gender: "Female", category: "SC", annual_income: 80000, state: "Maharashtra", district: "Mumbai Suburbs", business_type: "Tailoring", loan_amount_requested: 100000, matched_scheme_id: "SCH_MSY", matched_partner_id: "CP_MH_SCA_01", status: "New", stuck_alert: false, intake_transcript: "मला मुंबईमध्ये शिलाई व्यवसायासाठी ₹१,००,००० कर्ज हवे आहे." }
  ];

  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "All") query.append("status", statusFilter);
      if (stateFilter !== "All") query.append("state", stateFilter);

      // Parallel fetch for maximum speed & instant loading
      const [metricsRes, appRes] = await Promise.all([
        fetch(apiUrl('/api/admin/metrics')).catch(() => null),
        fetch(apiUrl(`/api/admin/applicants?${query.toString()}`)).catch(() => null)
      ]);

      if (metricsRes && metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (appRes && appRes.ok) {
        const appData = await appRes.json();
        if (appData.applicants && appData.applicants.length > 0) {
          setApplicants(appData.applicants);
        }
      }
    } catch (err) {
      console.warn("Admin API endpoint fallback:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, stateFilter]);

  // Initial load + refetch when filters change
  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Supabase real-time subscription — broadcasts new applicants and status updates
  // to all connected admin tabs without requiring a manual refresh.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Dynamically import to avoid crashing when Supabase is not configured
    import('../../context/SupabaseAuthContext').then(({ supabase }) => {
      if (!supabase) return;

      const channel = supabase
        .channel('admin-applicants-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'applicants' },
          (payload) => {
            // INSERT: prepend new row
            if (payload.eventType === 'INSERT') {
              const r = payload.new;
              const normalised = {
                id: r.applicant_id,
                name: r.name || '',
                age: r.age,
                gender: r.gender || '',
                category: r.caste_category || '',
                annual_income: r.annual_income || 0,
                district: (r.state_district || '').split(',')[0].trim(),
                state: (r.state_district || '').split(',').pop().trim(),
                business_type: r.business_sector || '',
                loan_amount_requested: r.loan_needed || 0,
                matched_scheme_id: '',
                matched_partner_id: '',
                status: (r.status || 'New').replace('Pending Documents', 'Pending Docs'),
                stuck_alert: r.status === 'Pending Documents' || r.status === 'Pending Docs',
                created_at: r.created_at,
                intake_transcript: r.nlp_intake_text || '',
                detected_language: r.detected_language || 'en-IN',
              };
              setApplicants(prev => [normalised, ...prev]);
              setMetrics(prev => prev ? { ...prev, total_applicants: (prev.total_applicants || 0) + 1 } : prev);
            }
            // UPDATE: patch the existing row in-place
            if (payload.eventType === 'UPDATE') {
              const r = payload.new;
              setApplicants(prev => prev.map(a =>
                a.id === r.applicant_id
                  ? { ...a, status: (r.status || '').replace('Pending Documents', 'Pending Docs'), stuck_alert: r.status === 'Pending Documents' || r.status === 'Pending Docs' }
                  : a
              ));
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    });
  }, [isSupabaseConfigured, session]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await fetch(apiUrl('/api/admin/applicant-status'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: appId, new_status: newStatus })
      });
      fetchAdminData();
    } catch (err) {
      console.warn("Status update fallback:", err);
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    }
  };

  const filteredApplicants = applicants.filter(a => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return a.name.toLowerCase().includes(term) || a.id.toLowerCase().includes(term) || a.district.toLowerCase().includes(term);
  });

  const COLORS = ['#f59e0b', '#10b981', '#38bdf8', '#a855f7', '#ec4899'];

  const schemeChartData = metrics?.scheme_uptake ? Object.entries(metrics.scheme_uptake).map(([name, val]) => ({ name, val })) : [];
  const stateChartData = metrics?.state_distribution ? Object.entries(metrics.state_distribution).map(([name, val]) => ({ name, val })) : [];

  return (
    <div className="space-y-6">
      
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-extrabold font-outfit flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            <Layers className="w-6 h-6 text-amber-500" />
            {t.adminHeader}
          </h2>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Real-time operational monitoring of NSFDC applicant flow, scheme uptake, and Channel Partner performance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* NSFDC Admin badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
            theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            <UserCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold">{adminProfile?.full_name || 'NSFDC Officer'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-500">
              {adminProfile?.role === 'regional_head' ? 'Regional Head' : 'Officer'}
            </span>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.btnRefresh}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1 */}
        <div className={`glass-card rounded-2xl p-4 border ${theme === 'light' ? 'bg-white border-slate-200' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1 font-semibold">
            <span>{t.totalApplicants}</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-extrabold font-outfit ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            {metrics?.total_applicants || 0}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">↑ +14% this week</span>
        </div>

        {/* Card 2 */}
        <div className={`glass-card rounded-2xl p-4 border ${theme === 'light' ? 'bg-white border-slate-200' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1 font-semibold">
            <span>{t.approvalRate}</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-outfit">
            96.2%
          </div>
          <span className="text-[10px] text-slate-500">Zero black-box rejections</span>
        </div>

        {/* Card 3 */}
        <div className={`glass-card rounded-2xl p-4 border ${theme === 'light' ? 'bg-white border-slate-200' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1 font-semibold">
            <span>{t.avgMatchTime}</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-outfit">
            {metrics?.avg_match_time_seconds || 1.4}s
          </div>
          <span className="text-[10px] text-slate-500">Target &lt; 3 seconds</span>
        </div>

        {/* Card 4 */}
        <div className={`glass-card rounded-2xl p-4 border ${theme === 'light' ? 'bg-white border-slate-200' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1 font-semibold">
            <span>{t.activePartners}</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-outfit">
            {metrics?.active_channel_partners_count || 6}
          </div>
          <span className="text-[10px] text-slate-500">SCAs &amp; Bank Hubs</span>
        </div>

        {/* Card 5 */}
        <div className={`glass-card rounded-2xl p-4 border col-span-2 lg:col-span-1 ${theme === 'light' ? 'bg-white border-slate-200' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center text-slate-500 text-xs mb-1 font-semibold">
            <span>{t.stuckAlerts}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-outfit">
            {metrics?.stuck_cases_count || 0}
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Pending document alerts</span>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scheme Uptake Bar Chart */}
        <div className={`lg:col-span-7 glass-panel rounded-2xl p-5 border ${
          theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800'
        }`}>
          <h3 className={`text-sm font-bold font-outfit mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Scheme Uptake Distribution (Applicant Demand)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schemeChartData}>
                <XAxis dataKey="name" stroke={theme === 'light' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <YAxis stroke={theme === 'light' ? '#94a3b8' : '#64748b'} fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{
                  background: theme === 'light' ? '#ffffff' : '#0f172a',
                  borderColor: theme === 'light' ? '#e2e8f0' : '#334155',
                  color: theme === 'light' ? '#0f172a' : '#ffffff',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} />
                <Bar dataKey="val" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Breakdown Pie Chart */}
        <div className={`lg:col-span-5 glass-panel rounded-2xl p-5 border ${
          theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800'
        }`}>
          <h3 className={`text-sm font-bold font-outfit mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Regional Applicant Concentration
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stateChartData} dataKey="val" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {stateChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  background: theme === 'light' ? '#ffffff' : '#0f172a',
                  borderColor: theme === 'light' ? '#e2e8f0' : '#334155',
                  color: theme === 'light' ? '#0f172a' : '#ffffff',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Applicant Triage Table */}
      <div className={`glass-panel rounded-2xl p-6 border space-y-4 ${
        theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800'
      }`}>
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
              }`}
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`border text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer ${
                theme === 'light'
                  ? 'bg-white border-slate-300 text-amber-700'
                  : 'bg-slate-900 border-slate-800 text-amber-400'
              }`}
            >
              <option value="All">{t.statusAll}</option>
              <option value="New">New</option>
              <option value="Matched">Matched</option>
              <option value="Under Review">Under Review</option>
              <option value="Pending Docs">Pending Docs</option>
              <option value="Disbursed">Disbursed</option>
            </select>

            {/* State Filter */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className={`border text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer ${
                theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-700'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <option value="All">{t.stateAll}</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>
        </div>

        {/* Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b uppercase tracking-wider font-bold ${
                theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
              }`}>
                <th className="p-3">Applicant ID &amp; Name</th>
                <th className="p-3">Location &amp; Sector</th>
                <th className="p-3">Requested Capital</th>
                <th className="p-3">Matched Scheme</th>
                <th className="p-3">Status Control</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'light' ? 'divide-slate-200/80' : 'divide-slate-800/60'}`}>
              {filteredApplicants.map((app) => (
                <React.Fragment key={app.id}>
                  <tr className={`transition-all ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                          className={`p-1 rounded transition-colors ${
                            theme === 'light' ? 'hover:bg-slate-200' : 'hover:bg-slate-800'
                          }`}
                        >
                          {expandedAppId === app.id ? (
                            <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                        <div>
                          <div className={`font-bold flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            <span>{app.name}</span>
                            {app.stuck_alert && (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" title="Missing documents alert" />
                            )}
                          </div>
                          <div className={`text-[10px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                            {app.id} • {app.category} ({app.gender})
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>{app.district}, {app.state}</div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{app.business_type}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{app.loan_amount_requested.toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Income: ₹{app.annual_income.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono font-bold text-[10px]">
                        {app.matched_scheme_id}
                      </span>
                    </td>

                    <td className="p-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer ${
                          app.status === 'Disbursed'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                            : app.status === 'Matched'
                            ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40'
                            : app.status === 'Pending Docs'
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <option value="New" className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>New</option>
                        <option value="Matched" className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Matched</option>
                        <option value="Under Review" className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Under Review</option>
                        <option value="Pending Docs" className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Pending Docs</option>
                        <option value="Disbursed" className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Disbursed</option>
                      </select>
                    </td>
                  </tr>

                  {/* Expandable Detail Row — shows original + translated transcript */}
                  {expandedAppId === app.id && (
                    <tr className={theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/40'}>
                      <td colSpan={5} className="p-4">
                        <div className={`rounded-xl border p-4 ${
                          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
                        }`}>
                          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            <Languages className="w-3.5 h-3.5 text-amber-500" />
                            Applicant Intake Transcript
                          </h4>
                          {app.intake_transcript ? (
                            <TranslatedCell originalText={app.intake_transcript} theme={theme} />
                          ) : (
                            <p className={`text-xs italic ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                              No voice/text transcript recorded for this applicant.
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
