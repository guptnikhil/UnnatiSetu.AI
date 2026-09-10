import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Building2, Phone, CheckCircle2, ShieldCheck, Clock, ArrowRight, Activity, Navigation, Locate, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

const STATE_COORDINATES = {
  'Uttar Pradesh': [26.8467, 80.9462],
  'Maharashtra': [19.0760, 72.8777],
  'Bihar': [25.6093, 85.1376],
  'Delhi': [28.6315, 77.2167],
  'Madhya Pradesh': [23.2599, 77.4126],
  'Rajasthan': [26.9124, 75.7873],
  'West Bengal': [22.5726, 88.3639],
  'Tamil Nadu': [13.0827, 80.2707],
};

function createMarkerIcon(isSelected, rank) {
  const size = isSelected ? 18 : 12;
  const color = isSelected ? '#f59e0b' : '#d97706';
  const ring = isSelected
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(245,158,11,0.5);animation:marker-pulse 1.5s ease-out infinite"></div>`
    : '';
  const label = rank != null
    ? `<div style="position:absolute;top:-8px;right:-8px;width:18px;height:18px;border-radius:50%;background:#f59e0b;color:#0f172a;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3)">${rank}</div>`
    : '';

  return L.divIcon({
    className: '',
    iconSize: [size * 2 + 16, size * 2 + 16],
    iconAnchor: [size + 8, size + 8],
    popupAnchor: [0, -(size + 8)],
    html: `<div style="position:relative;width:${size * 2 + 16}px;height:${size * 2 + 16}px;display:flex;align-items:center;justify-content:center">
      ${ring}
      <div style="width:${size * 2}px;height:${size * 2}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:all 0.3s ease"></div>
      ${label}
    </div>`,
  });
}

function createApplicantIcon() {
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid rgba(59,130,246,0.4);animation:marker-pulse 2s ease-out infinite"></div>
      <div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>
    </div>`,
  });
}

function FlyToPartner({ partner }) {
  const map = useMap();
  const prevRef = useRef(null);

  useEffect(() => {
    if (partner && partner.lat && partner.lng && prevRef.current !== partner.id) {
      prevRef.current = partner.id;
      map.flyTo([partner.lat, partner.lng], 10, { duration: 1.2 });
    }
  }, [partner, map]);

  return null;
}

function FlyToLocation({ position }) {
  const map = useMap();
  const prevRef = useRef(null);

  useEffect(() => {
    if (position && prevRef.current !== `${position[0]},${position[1]}`) {
      prevRef.current = `${position[0]},${position[1]}`;
      map.flyTo(position, 8, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

export default function PartnerLocator() {
  const { rankedPartners, selectedPartner, setSelectedPartner, setCurrentStep, t, lang, theme, selectedScheme, applicantProfile } = useApp();

  const [geoLocation, setGeoLocation] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocation([pos.coords.latitude, pos.coords.longitude]);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(err.code === 1 ? 'Permission denied' : 'Location unavailable');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setCurrentStep(5);
  };

  const center = useMemo(() => {
    if (geoLocation) return geoLocation;
    const state = applicantProfile?.state;
    if (state && STATE_COORDINATES[state]) return STATE_COORDINATES[state];
    if (rankedPartners.length > 0) {
      const p = rankedPartners[0].partner;
      return [p.lat, p.lng];
    }
    return [26.8467, 80.9462];
  }, [geoLocation, applicantProfile, rankedPartners]);

  const applicantPos = useMemo(() => {
    if (geoLocation) return geoLocation;
    const state = applicantProfile?.state;
    return STATE_COORDINATES[state] || null;
  }, [geoLocation, applicantProfile]);

  const darkTiles = theme !== 'light';

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
            Partners ranked on <span className="text-amber-600 dark:text-amber-400 font-bold">Eligibility Fit</span>, <span className="text-emerald-600 dark:text-emerald-400 font-bold">Processing Capacity</span>, and <span className="text-sky-600 dark:text-sky-400 font-bold">Geo Proximity</span>.
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

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`glass-panel rounded-2xl p-5 border space-y-4 sticky top-24 ${
            theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold font-outfit flex items-center gap-2 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                <Navigation className="w-4 h-4 text-amber-500" />
                Interactive Partner Map
              </h3>
              <button
                onClick={requestLocation}
                disabled={geoLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  geoLoading
                    ? 'opacity-60 cursor-wait'
                    : geoLocation
                    ? theme === 'light'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : theme === 'light'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                }`}
              >
                {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Locate className="w-3.5 h-3.5" />}
                {geoLoading ? 'Locating...' : geoLocation ? 'Location Active' : 'Use My Location'}
              </button>
            </div>

            {geoError && (
              <div className={`text-xs px-3 py-2 rounded-lg border ${
                theme === 'light' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {geoError === 'Permission denied' ? 'Location permission denied. Using state-based location.' : geoError}
              </div>
            )}

            {/* Real Leaflet Map */}
            <div className={`relative w-full h-64 sm:h-80 lg:h-[400px] rounded-xl overflow-hidden border ${
              theme === 'light' ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <style>{`
                @keyframes marker-pulse {
                  0% { transform: scale(1); opacity: 0.6; }
                  100% { transform: scale(2.2); opacity: 0; }
                }
                .leaflet-popup-content-wrapper {
                  border-radius: 12px !important;
                  box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
                }
                .leaflet-popup-content {
                  margin: 12px 16px !important;
                  font-family: 'Plus Jakarta Sans', sans-serif !important;
                }
                .dark-tiles {
                  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                }
              `}</style>
              <MapContainer
                center={center}
                zoom={geoLocation ? 8 : 6}
                className="w-full h-full z-0"
                scrollWheelZoom={true}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className={darkTiles ? 'dark-tiles' : ''}
                />

                <FlyToPartner partner={selectedPartner} />
                {geoLocation && <FlyToLocation position={geoLocation} />}

                {/* Applicant location marker */}
                {applicantPos && (
                  <Marker position={applicantPos} icon={createApplicantIcon()}>
                    <Popup>
                      <div style={{ minWidth: 140 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#3b82f6' }}>
                          {geoLocation ? 'Your Live Location' : 'Your Location'}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {geoLocation
                            ? `${geoLocation[0].toFixed(4)}, ${geoLocation[1].toFixed(4)}`
                            : `${applicantProfile?.district}, ${applicantProfile?.state}`}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Partner markers */}
                {rankedPartners.map((item, idx) => {
                  const p = item.partner;
                  const isSelected = selectedPartner?.id === p.id;
                  return (
                    <Marker
                      key={p.id}
                      position={[p.lat, p.lng]}
                      icon={createMarkerIcon(isSelected, idx + 1)}
                      eventHandlers={{
                        click: () => setSelectedPartner(p),
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: 180 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{p.address}</div>
                          <div style={{ display: 'flex', gap: 8, fontSize: 11, marginBottom: 8 }}>
                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{item.distance_km} km</span>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Score: {item.rank_score}</span>
                          </div>
                          <button
                            onClick={() => handleSelectPartner(p)}
                            style={{
                              width: '100%', padding: '6px 0', borderRadius: 8, border: 'none',
                              background: '#f59e0b', color: '#0f172a', fontWeight: 700, fontSize: 12,
                              cursor: 'pointer'
                            }}
                          >
                            Select Partner →
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Legend */}
            <div className={`flex items-center gap-4 text-[11px] ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm" />
                <span>Channel Partner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-600 border-2 border-white shadow-sm ring-2 ring-amber-500/40" />
                <span>Selected</span>
              </div>
            </div>

            {selectedPartner && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selected Channel Partner:
                </div>
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
