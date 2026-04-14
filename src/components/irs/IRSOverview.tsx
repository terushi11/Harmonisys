'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import {
  ArrowRight,
  PlusCircle,
  FilePlus2,
  FileText,
  CalendarDays,
  BarChart3,
  Info,
  Layers,
  Clock3,
  CheckSquare,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

import Questionnaire from './Questionnaire';
import SuccessDialog from '../SuccessDialog';

import {
  PHILIPPINE_REGIONS,
  REGION_ALIASES,
  CITY_TO_REGION,
} from '@/utils/philippineRegions';

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#7B122F', '#8B5CF6', '#d406a4'];

type IncidentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type Incident = {
  id: string;
  location: string;
  date: string;
  summary: string;
  description: string;
  category: string;
  reporter: string | null;
  contact: string | null;
  severity: SeverityLevel | string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  teamDeployed: string;
  otherCategoryDetail: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  status: IncidentStatus;
};

// ---- 3D Bar helpers (Recharts custom shape) ----
const clamp = (n: number, min = 0, max = 255) => Math.max(min, Math.min(max, n));

const shadeHex = (hex: string, percent: number) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const t = percent / 100;

  const nr = clamp(Math.round(r + (255 - r) * t));
  const ng = clamp(Math.round(g + (255 - g) * t));
  const nb = clamp(Math.round(b + (255 - b) * t));

  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
};

const Bar3D = (props: any) => {
  const { x, y, width, height, fill, payload } = props;
  if (height <= 0 || width <= 0) return null;

  const d = Math.min(10, Math.max(6, Math.round(width * 0.18)));
  const front = fill || '#3B82F6';

  const right = shadeHex(front, -18);
  const top = shadeHex(front, 18);

  const frontTop = shadeHex(front, 22);
  const frontBottom = shadeHex(front, -4);

  const rightTop = shadeHex(right, 14);
  const rightBottom = shadeHex(right, -6);

  const topA = shadeHex(top, 25);
  const topB = shadeHex(top, -5);

  const fx = x;
  const fy = y;
  const fw = width;
  const fh = height;

  const topPts = `
    ${fx - 0.8},${fy}
    ${fx + d},${fy - d}
    ${fx + fw + d + 0.8},${fy - d}
    ${fx + fw + 0.8},${fy}
  `;

  const rightPts = `
    ${fx + fw},${fy}
    ${fx + fw + d},${fy - d}
    ${fx + fw + d},${fy + fh - d + 0.8}
    ${fx + fw},${fy + fh + 0.8}
  `;

  const key = payload?.name ? String(payload.name).replace(/\s+/g, '-') : `${fx}-${fy}`;
  const gidFront = `g-front-${key}`;
  const gidRight = `g-right-${key}`;
  const gidTop = `g-top-${key}`;

  return (
    <g>
      <defs>
        <linearGradient id={gidFront} x1="0" y1={fy} x2="0" y2={fy + fh} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={frontTop} />
          <stop offset="100%" stopColor={frontBottom} />
        </linearGradient>

        <linearGradient id={gidRight} x1={fx + fw} y1={fy} x2={fx + fw} y2={fy + fh} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={rightTop} />
          <stop offset="100%" stopColor={rightBottom} />
        </linearGradient>

        <linearGradient id={gidTop} x1={fx} y1={fy - d} x2={fx + fw + d} y2={fy} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={topA} />
          <stop offset="100%" stopColor={topB} />
        </linearGradient>
      </defs>

      <path
        d={`M ${fx} ${fy + fh} L ${fx + fw} ${fy + fh} L ${fx + fw + d} ${fy + fh - d} L ${fx + d} ${fy + fh - d} Z`}
        fill="rgba(0,0,0,0.06)"
      />

      <polygon points={rightPts} fill={`url(#${gidRight})`} />
      <polygon points={topPts} fill={`url(#${gidTop})`} />

      <rect x={fx} y={fy} width={fw} height={fh} rx={0} ry={0} fill={`url(#${gidFront})`} />

      <rect
        x={fx + 1}
        y={fy + 1}
        width={Math.max(0, fw - 2)}
        height={Math.max(0, fh - 2)}
        fill="transparent"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1"
      />
    </g>
  );
};

const normalizeLocationToken = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*\(.*?\)\s*/g, '')
    .replace(/\bcity\b/g, '')
    .replace(/\bmunicipality\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const findRegionByNormalizedCity = (value: string) => {
  const normalizedValue = normalizeLocationToken(value);
  if (!normalizedValue) return null;

  for (const [knownCity, region] of Object.entries(CITY_TO_REGION)) {
    if (normalizeLocationToken(knownCity) === normalizedValue) {
      return region;
    }
  }

  return null;
};

const toTitleCase = (value: string) =>
  value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

const findCanonicalCityName = (value: string) => {
  const normalizedValue = normalizeLocationToken(value);
  if (!normalizedValue) return null;

  for (const knownCity of Object.keys(CITY_TO_REGION)) {
    if (normalizeLocationToken(knownCity) === normalizedValue) {
      return toTitleCase(normalizeLocationToken(knownCity));
    }
  }

  return null;
};

const isKnownPhilippineCity = (value: string) => {
  return findRegionByNormalizedCity(value) !== null;
};

const extractRegion = (rawLocation: string) => {
  const value = rawLocation.trim();
  if (!value) return 'Unknown';

  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return 'Unknown';

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (REGION_ALIASES[lower]) return REGION_ALIASES[lower];
  }

  const city = extractCity(rawLocation);
  return findRegionByNormalizedCity(city) ?? 'Unknown';
};

const extractCity = (rawLocation: string) => {
  const value = rawLocation.trim();
  if (!value) return 'Unknown';

  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return 'Unknown';

  const ignored = new Set([
    'metro manila',
    'ncr',
    'national capital region',
    'philippines',
  ]);

  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    const lower = part.toLowerCase();

    if (ignored.has(lower)) continue;

    if (
      lower.includes('city') ||
      lower.includes('municipality') ||
      CITY_TO_REGION[lower] ||
      findRegionByNormalizedCity(part)
    ) {
      return findCanonicalCityName(part) ?? 'Unknown';
    }
  }

  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (isKnownPhilippineCity(part)) {
      return findCanonicalCityName(part) ?? 'Unknown';
    }
  }

  return 'Unknown';
  };

type IRSOverviewProps = {
  name: string;
  subheading?: string;
  description: string;
  imageUrl: string;
  urls: string[];
  isAuthenticated?: boolean;
  protectedRoutes?: string[];
  userRole?: 'ADMIN' | 'RESPONDER' | 'STANDARD' | string;
};

export default function IRSOverview({
  name,
  subheading,
  description,
  imageUrl,
  urls,
  isAuthenticated = false,
  userRole = 'STANDARD',
}: IRSOverviewProps) {
  void urls;

  const isAdmin = userRole === 'ADMIN';
  const canSeeAnalytics = isAdmin || (isAuthenticated && userRole === 'RESPONDER');
  const canViewIncidents = isAuthenticated && (isAdmin || userRole === 'RESPONDER');

  const [open, setOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

  const [statsInView, setStatsInView] = useState(false);
  const [locInView, setLocInView] = useState(false);

  const statsRef = useRef<HTMLDivElement | null>(null);
  const locRef = useRef<HTMLDivElement | null>(null);

  const [barChartKey, setBarChartKey] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState('ALL');

  const fetchIncidents = useCallback(async () => {
    if (!canSeeAnalytics && userRole !== 'ADMIN') return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/incidents', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`Failed to fetch incidents: ${response.status}`);
      }

      const result = await response.json();
      setIncidents(Array.isArray(result?.data) ? (result.data as Incident[]) : []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [canSeeAnalytics, userRole]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    const makeObserver = (onEnter: () => void, onExit?: () => void) =>
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) onEnter();
          else onExit?.();
        },
        { threshold: 0.35 }
      );

    const statsObs = makeObserver(
      () => setStatsInView(true),
      () => setStatsInView(false)
    );

    const locObs = makeObserver(
      () => {
        setLocInView(true);
        setBarChartKey((k) => k + 1);
      },
      () => setLocInView(false)
    );

    if (statsRef.current) statsObs.observe(statsRef.current);
    if (locRef.current) locObs.observe(locRef.current);

    return () => {
      statsObs.disconnect();
      locObs.disconnect();
    };
  }, []);

  const regionOptions = ['ALL', ...PHILIPPINE_REGIONS];

  const filteredIncidents = useMemo(() => {
    if (selectedRegion === 'ALL') return incidents;

    return incidents.filter(
      (incident) => extractRegion(incident.location || '') === selectedRegion
    );
  }, [incidents, selectedRegion]);

  const incidentStats = {
    total: filteredIncidents.length,
    active: filteredIncidents.filter(
      (i) => i.status === 'PENDING' || i.status === 'APPROVED'
    ).length,
    resolved: filteredIncidents.filter((i) => i.status === 'RESOLVED').length,
    locations: new Set(
      filteredIncidents
        .map((i) => extractCity(i.location || 'Unknown'))
        .filter((city) => city !== 'Unknown')
    ).size,
  };

  const locationData = useMemo(() => {
    const locationCounts: Record<string, number> = {};

    filteredIncidents.forEach((incident) => {
      const city =
        typeof incident.location === 'string' && incident.location.trim()
          ? extractCity(incident.location)
          : 'Unknown';

      if (city === 'Unknown') return;

      locationCounts[city] = (locationCounts[city] || 0) + 1;
    });

    return Object.entries(locationCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredIncidents]);

  const topLocations = useMemo(() => {
    return [...locationData]
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
      }));
  }, [locationData]);

  useEffect(() => {
    setLocInView(false);

    const timer = setTimeout(() => {
      setBarChartKey((k) => k + 1);
      setLocInView(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedRegion]);

  const handleCloseModal = () => setOpen(false);

  const handleReportSuccess = async () => {
    await fetchIncidents();
    setShowSuccessDialog(true);
  };

  const cardGlass =
    'relative rounded-3xl overflow-hidden ' +
    'bg-white/65 border border-white/100 ' +
    'shadow-[0_0_0_1.5px_rgba(255,255,255,0.75),0_18px_45px_rgba(0,0,0,0.22)] ' +
    'transition-shadow duration-300 ' +
    'hover:shadow-[0_0_0_2px_rgba(255,255,255,0.90),0_22px_60px_rgba(0,0,0,0.25)]';

  const innerGlass =
    'bg-white/90 border border-white/70 ' +
    'shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_12px_28px_rgba(0,0,0,0.18),0_0_40px_rgba(255,255,255,0.22)]';

  const statCardBase =
    'relative overflow-hidden rounded-3xl border border-white/70 ' +
    'shadow-[0_0_0_1.5px_rgba(255,255,255,0.78),0_16px_40px_rgba(0,0,0,0.16)]';

  const coreFeatures = [
    {
      title: 'Report Incident',
      subtitle: 'Submit an incident report',
      icon: <FilePlus2 className="h-5 w-5 text-white" />,
      iconBg: 'bg-gradient-to-r from-[#8B1538] to-[#C01F4B]',
      onClick: () => setOpen(true),
      locked: !isAdmin && !isAuthenticated,
    },
    {
      title: 'View Incidents',
      subtitle: 'Browse incidents by date & severity',
      icon: <CalendarDays className="h-5 w-5 text-white" />,
      iconBg: 'bg-gradient-to-r from-[#D97706] to-[#F59E0B]',
      href: '/incidents',
      locked: !canViewIncidents,
    },
    {
      title: 'Reports & Analytics',
      subtitle: 'Summaries, charts, and comparisons',
      icon: <BarChart3 className="h-5 w-5 text-white" />,
      iconBg: 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5]',
      onClick: () => {
        const el = document.getElementById('reports-analytics');
        if (!el) return;
        history.replaceState(null, '', '#reports-analytics');
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
      locked: !isAdmin && !canSeeAnalytics,
    },
  ];

  const shortLabel = (value: any, max = 14) => {
    const s = String(value ?? '');
    return s.length > max ? `${s.slice(0, max)}…` : s;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-2xl border border-white/60 bg-white/90 px-4 py-2 shadow-xl">
        <p className="text-xs font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-700">
          <span className="font-extrabold">{payload[0].value}</span> incidents
        </p>
      </div>
    );
  };

  return (
    <div
      className="min-h-dvh w-full"
      style={{
        background:
          'linear-gradient(135deg, rgba(123,18,47,0.10) 0%, rgba(123,18,47,0.18) 35%, rgba(123,18,47,0.12) 100%)',
      }}
    >
      <div className="container mx-auto px-4 pt-10 pb-6 max-w-7xl">
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-start">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-[#7B122F] [text-shadow:0_3px_12px_rgba(255,255,255,0.95)]">
              {name}
            </h1>

            <p className="text-base sm:text-lg text-black">{subheading}</p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                className={`font-bold min-w-[200px] h-12 shadow-xl transition-all duration-300 ${
                  isAuthenticated
                    ? 'bg-[#7B122F] hover:bg-[#651026] text-white hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02]'
                    : 'bg-[#7B122F]/40 text-white/70 cursor-not-allowed'
                }`}
                size="lg"
                endContent={<FilePlus2 className="w-5 h-5" />}
                onPress={() => {
                  if (!isAuthenticated) return;
                  setOpen(true);
                }}
                isDisabled={!isAuthenticated}
              >
                Report Incident
              </Button>

              {canViewIncidents ? (
                <Button
                  as={Link}
                  href="/incidents"
                  className="font-bold bg-white/95 hover:bg-white text-[#7B122F] border border-white/70 min-w-[200px] h-12 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
                  size="lg"
                >
                  See Incidents
                </Button>
              ) : (
                <Button
                  className="font-bold bg-white/70 text-[#7B122F]/50 border border-white/70 min-w-[200px] h-12 shadow-xl cursor-not-allowed"
                  size="lg"
                  isDisabled
                >
                  See Incidents
                </Button>
              )}
            </div>
          </div>

          <div className="flex lg:justify-end">
            <div className="relative w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] lg:w-[170px] lg:h-[170px]">
              <Image
                src={imageUrl || '/placeholder.svg'}
                alt={`${name} logo`}
                fill
                className="object-contain drop-shadow-md"
                sizes="170px"
                priority
              />
            </div>
          </div>
        </div>

        {(!isAuthenticated || userRole === 'STANDARD' || userRole === 'ADMIN') && (
          <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-stretch mt-10">
            <Card className={`${cardGlass} h-full`}>
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1.5 ring-white/60" />

              <CardHeader className="pt-7 pb-2">
                <div className="w-full px-2 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-[#7B122F] flex items-center justify-center shadow">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#7B122F]">About IRS</h2>
                      <div className="mt-2 h-[2px] w-20 bg-[#7B122F]/60 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="pt-3 space-y-5 px-5 sm:px-7 pb-7">
                <p className="text-[16.5px] sm:text-lg text-slate-800 leading-relaxed [text-align:justify]">
                  {description}
                </p>

                <div className="rounded-2xl border border-white/55 bg-white/50 p-5 shadow-sm">
                  <div className="border-l-4 border-[#7B122F] pl-4 text-slate-700 leading-relaxed text-[15px] sm:text-[16px] [text-align:justify]">
                    The tool was developed under the Disaster Risk Reduction and Management in Health Center under the
                    NICHE Centers in the Regions for R&amp;D (NICER) program for the Disaster Risk Reduction and
                    Management in Health Center of the University of the Philippines Manila, headed by Dr. Carlos
                    Primero D. Gundran.
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card
              className="relative rounded-3xl overflow-hidden bg-[#7B122F]/80 border border-white/25
              shadow-[0_0_0_1.5px_rgba(255,255,255,0.70),0_18px_45px_rgba(0,0,0,0.28)]
              hover:shadow-[0_0_0_2px_rgba(255,255,255,0.85),0_22px_55px_rgba(0,0,0,0.30)]
              transition-shadow duration-300 h-full"
            >
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/35" />

              <CardHeader className="pt-7 pb-2">
                <div className="w-full px-2 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center shadow ring-1 ring-white/40">
                      <Layers className="w-5 h-5 text-[#7B122F]" />
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white">Core Features</h3>
                      <div className="mt-2 h-[2px] w-20 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="pt-3 space-y-4 px-5 sm:px-7 pb-7">
                {coreFeatures.map((f) => {
                  const content = (
                    <div
                      className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 ${innerGlass}
                        transition-transform duration-200 hover:-translate-y-0.5`}
                    >
                      <div className={`h-12 w-12 rounded-2xl ${f.iconBg} flex items-center justify-center shadow-lg`}>
                        {f.icon}
                      </div>

                      <div className="flex-1">
                        <p className="font-bold text-[#6A0F29] text-[17px] leading-tight">{f.title}</p>
                        <p className="text-[13.5px] text-slate-600">{f.subtitle}</p>
                      </div>

                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  );

                  if (f.locked) {
                    return (
                      <div key={f.title} className="w-full cursor-not-allowed opacity-60">
                        {content}
                      </div>
                    );
                  }

                  if (f.onClick) {
                    return (
                      <button key={f.title} type="button" onClick={f.onClick} className="w-full text-left">
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link key={f.title} href={f.href ?? '#'} className="block">
                      {content}
                    </Link>
                  );
                })}
              </CardBody>
            </Card>
          </div>
        )}

        {canSeeAnalytics && (
          <div id="reports-analytics" className="mt-10 pb-8 scroll-mt-20">
            <div className="mb-8" ref={statsRef}>
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex items-center gap-3 xl:pb-1">
                  <div className="h-10 w-1.5 rounded-full bg-[#7B122F]" />
                  <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 leading-tight">
                    Incident Status Overview
                  </h2>
                </div>

                <div className="w-full xl:w-[295px]">
                  <select
                    id="region-filter"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="h-11 w-full rounded-[16px] border border-white/80 bg-white/95 px-4 text-[14px] font-semibold text-slate-800 shadow-[0_8px_20px_rgba(0,0,0,0.10)] outline-none transition-all duration-200 hover:shadow-[0_10px_24px_rgba(0,0,0,0.14)] focus:border-[#7B122F] focus:ring-2 focus:ring-[#7B122F]/20"
                  >
                    <option value="ALL">Filter by Region — All Regions</option>
                    {regionOptions
                      .filter((region) => region !== 'ALL')
                      .map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Total Reports */}
                <Card className={`${statCardBase} bg-gradient-to-br from-blue-500/20 via-blue-100/40 to-white border border-blue-500/30`}>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">Total Reports</p>
                          <p className="text-xs text-black">All submitted incidents</p>
                        </div>
                      </div>

                      <span className="text-3xl font-black text-slate-900">
                        {loading ? '—' : incidentStats.total}
                      </span>
                    </div>

                    <div className="mt-4 h-2 w-full rounded-full bg-blue-500/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{
                          width: statsInView ? '100%' : '0%',
                          transition: 'width 2000ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Active Incidents */}
                <Card className={`${statCardBase} bg-gradient-to-br from-blue-500/20 via-blue-100/40 to-white border border-blue-500/30`}>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                          <Clock3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">Active Incidents</p>
                          <p className="text-xs text-black">Ongoing cases</p>
                        </div>
                      </div>

                      <span className="text-3xl font-black text-slate-900">
                        {loading ? '—' : incidentStats.active}
                      </span>
                    </div>

                    <div className="mt-4 h-2 w-full rounded-full bg-blue-500/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{
                          width: statsInView
                            ? `${incidentStats.total ? Math.round((incidentStats.active / incidentStats.total) * 100) : 0}%`
                            : '0%',
                          transition: 'width 2000ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Resolved */}
                <Card className={`${statCardBase} bg-gradient-to-br from-green-500/15 to-white border border-green-500/20`}>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-green-500/25 flex items-center justify-center shadow-md">
                          <CheckSquare className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">Resolved</p>
                          <p className="text-xs text-black">Handled incidents</p>
                        </div>
                      </div>

                      <span className="text-3xl font-black text-slate-900">
                        {loading ? '—' : incidentStats.resolved}
                      </span>
                    </div>

                    <div className="mt-4 h-2 w-full rounded-full bg-green-500/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: statsInView
                            ? `${incidentStats.total ? Math.round((incidentStats.resolved / incidentStats.total) * 100) : 0}%`
                            : '0%',
                          transition: 'width 2000ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Locations */}
                <Card className={`${statCardBase} bg-gradient-to-br from-green-500/20 via-green-100/40 to-white border border-green-500/30`}>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                          <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">Locations</p>
                          <p className="text-xs text-black">Affected areas</p>
                        </div>
                      </div>

                      <span className="text-3xl font-black text-slate-900">
                        {loading ? '—' : incidentStats.locations}
                      </span>
                    </div>

                    <div className="mt-4 h-2 w-full rounded-full bg-green-500/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{
                          width: statsInView
                            ? `${incidentStats.total ? Math.round((incidentStats.locations / incidentStats.total) * 100) : 0}%`
                            : '0%',
                          transition: 'width 2000ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </CardBody>
                </Card>

              </div>
            </div>

            <div className="mt-6" ref={locRef}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-1.5 rounded-full bg-[#7B122F]" />
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 leading-tight">
                  Incidents by Location
                  {selectedRegion !== 'ALL' ? ` — ${selectedRegion}` : ''}
                </h2>
              </div>

              <Card className={`${cardGlass} bg-gradient-to-br from-[#7B122F]/10 via-white/55 to-white/35`}>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_15%,rgba(123,18,47,0.18),transparent_60%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_55%_at_85%_35%,rgba(59,130,246,0.12),transparent_60%)]" />
                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1.5 ring-white/60" />

                <CardBody className="pt-5 px-4 sm:px-6 pb-5">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <div className="lg:col-span-1 rounded-3xl border border-white/55 bg-white/55 px-6 py-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-lg font-extrabold text-slate-900">Top Locations</p>
                          <p className="text-sm text-slate-600">Highest incident activity</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Total</p>
                          <p className="text-2xl font-black text-slate-900">
                            {loading ? '—' : incidentStats.total}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-4">
                        {topLocations.length === 0 ? (
                          <p className="text-sm text-slate-600">
                            {loading ? 'Loading locations…' : 'No location data yet.'}
                          </p>
                        ) : (
                          topLocations.map((loc) => (
                            <div key={loc.name} className="flex items-center gap-3">
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: loc.color }} />
                              <div className="flex-1">
                                <p className="font-bold text-slate-900 leading-tight">{loc.name}</p>
                                <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      backgroundColor: loc.color,
                                      width: locInView
                                        ? `${incidentStats.total ? Math.round((loc.value / incidentStats.total) * 100) : 0}%`
                                        : '0%',
                                      transition: 'width 2000ms cubic-bezier(0.16, 1, 0.3, 1)',
                                    }}
                                  />
                                </div>
                              </div>
                              <p className="w-8 text-right font-extrabold text-slate-900">{loc.value}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-2 rounded-3xl border border-white/55 bg-white/55 p-4 sm:p-5">
                      <div className="h-[300px] sm:h-[330px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            key={barChartKey}
                            data={topLocations}
                            margin={{ top: 12, right: 0, left: 0, bottom: 18 }}
                            barCategoryGap="10%"
                            barGap={2}
                          >
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                            <XAxis
                              dataKey="name"
                              interval={0}
                              height={52}
                              tickLine={false}
                              axisLine={{ stroke: 'rgba(0,0,0,0.18)' }}
                              tick={{ fontSize: 12, fill: 'rgba(15,23,42,0.85)' }}
                              tickFormatter={(v) => shortLabel(v, 16)}
                              padding={{ left: 0, right: 0 }}
                            />

                            <YAxis allowDecimals={false} width={32} />

                            <Tooltip content={<CustomTooltip />} />

                            <Bar
                              dataKey="value"
                              shape={<Bar3D />}
                              maxBarSize={90}
                              isAnimationActive={locInView}
                              animationDuration={900}
                              animationEasing="ease-out"
                            >
                              {topLocations.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-2 h-3 w-full rounded-full bg-gradient-to-r from-black/5 via-black/0 to-black/5" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-white/85 backdrop-blur-md shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/60 rounded-3xl">
              <CardHeader className="pb-4 border-b border-[#7B122F]/15 bg-white/80 backdrop-blur-md">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-[#7B122F] to-[#A3153D] rounded-xl shadow-lg ring-1 ring-white/25">
                      <PlusCircle className="w-6 h-6 text-white" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-[#7B122F] drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]">
                        Report Incident
                      </h2>
                      <p className="text-slate-600 text-sm">Submit a new incident report</p>
                    </div>
                  </div>

                  <Button isIconOnly variant="light" onPress={handleCloseModal} className="hover:bg-[#7B122F]/10">
                    <svg className="w-6 h-6 text-slate-400 hover:text-[#7B122F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              </CardHeader>

              <CardBody className="p-6">
                <Questionnaire onClose={handleCloseModal} openSuccessModal={handleReportSuccess} />
              </CardBody>
            </Card>
          </div>
        )}

        <SuccessDialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)} />
      </div>
    </div>
  );
}