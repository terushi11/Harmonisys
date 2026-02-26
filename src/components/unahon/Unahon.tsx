'use client';

import { getUnahonFormsSummary } from '@/lib/action/unahon';
import type { UnahonDashboardProps, UnahonSummary, UnahonProps } from '@/types';
import { Skeleton, Card, CardBody, CardHeader, Button } from '@heroui/react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts';

import {
  BellRing,
  AlertTriangle,
  ShieldCheck,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UnahonManagement from '@/components/unahon/UnahonManagement';
import UnahonForm from '@/components/unahon/UnahonForm';
import Link from 'next/link';

const Unahon = ({ session }: UnahonDashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<UnahonSummary | null>(null);
  const [showManagement, setShowManagement] = useState(true);

  const [isUnahonView, setIsUnahonView] = useState<boolean>(false);
  const [isReassessment, setIsReassessment] = useState<boolean>(false);

  
  const [currentUnahonProps, setCurrentUnahonProps] = useState<UnahonProps>({
    session: session!,
    isViewOnly: false,
    isReassessment: false,
  });

  const router = useRouter();
  const userRole = session?.user?.role;
const isResponderView = userRole === 'RESPONDER';


  // ✅ Unahon red theme tokens
  const BG = 'bg-gradient-to-br from-rose-50 via-red-50 to-amber-50';
  const TITLE_GRADIENT = 'from-[#7A0C1E] via-[#991B1B] to-[#B91C1C]';
  const ACCENT_BAR = 'from-[#991B1B] to-[#B91C1C]';
  const BTN = 'bg-[#B91C1C] hover:bg-[#991B1B]';

  // ✅ Unified button motion (same hover feel for both)
  const BTN_MOTION =
    'shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105';

  // ✅ Better-looking Go Back (light red, cleaner)
  const GO_BACK =
    'h-12 bg-white/70 backdrop-blur-sm border border-[#B91C1C]/25 text-[#7A0C1E] ' +
    'hover:bg-[#B91C1C]/10 hover:border-[#B91C1C]/40 font-semibold ' +
    'transition-all duration-500 ' +
    'shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105';

      // ✅ SAMPLE DATA (remove this once Firebase / real data is available)------------
  const SAMPLE_SUMMARY: UnahonSummary = {
    redCount: 6,
    yellowCount: 10,
    greenCount: 18,
    noneCount: 3,
    initialAssessment: 20,
    reassessment: 17,
  };

  // ✅ Use sample if summary is null (remove fallback later)


    // ✅ Use sample if summary is null OR returns all zeros (remove this later)
  const isAllZero =
    !!summary &&
    summary.redCount === 0 &&
    summary.yellowCount === 0 &&
    summary.greenCount === 0 &&
    summary.noneCount === 0 &&
    summary.initialAssessment === 0 &&
    summary.reassessment === 0;

  const displaySummary = !summary || isAllZero ? SAMPLE_SUMMARY : summary;

  //  const displaySummary = summary ?? SAMPLE_SUMMARY;


  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);

      try {
        const data = await getUnahonFormsSummary();
        setSummary(data);
      } catch (error) {
        console.log('Error in loading summary', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const handleManagementStateChange = (isViewing: boolean) => {
    setShowManagement(!isViewing);
  };

  const handleUnahonStateChange = (
    isViewing: boolean,
    isReassessing: boolean,
    props?: UnahonProps
  ) => {
    setIsUnahonView(isViewing);
    setIsReassessment(isReassessing);
    if (props) {
      setCurrentUnahonProps(props);
    }
  };

  const handleReturnToManagement = () => {
    setIsUnahonView(false);
    setIsReassessment(false);
    setCurrentUnahonProps({
      session: session!,
      isViewOnly: false,
      isReassessment: false,
    });
  };

  if (isUnahonView || isReassessment) {
    return (
      <UnahonForm
        {...currentUnahonProps}
        onReturnToManagement={handleReturnToManagement}
      />
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen ${BG}`}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Actions row (Go Back beside Form placeholder) */}
          <div className="mb-6 flex justify-end gap-3">
            {!isResponderView && (
            <Button
              as={Link}
              href="/overview/unahon"
              variant="bordered"
              startContent={<ArrowLeft className="w-4 h-4" />}
              className={GO_BACK}
            >
              Go Back
            </Button>
            )}

            <Skeleton className="w-[180px] h-12 rounded-lg" />
          </div>

          <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
            <CardBody className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1
                    className={`text-4xl lg:text-5xl font-black bg-gradient-to-r ${TITLE_GRADIENT} bg-clip-text text-transparent mb-2`}
                  >
                    Unahon Dashboard
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Comprehensive overview of assessment data and analytics
                  </p>
                </div>
                <div />
              </div>
            </CardBody>
          </Card>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div
                className={`w-1 h-8 bg-gradient-to-b ${ACCENT_BAR} rounded-full`}
              />
              Assessment Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={index}
                  className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 animate-pulse"
                >
                  <CardBody className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Skeleton className="w-14 h-14 rounded-xl" />
                      <div className="flex-1">
                        <Skeleton className="w-32 h-6 rounded-lg mb-2" />
                        <Skeleton className="w-24 h-4 rounded-lg" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <Skeleton className="w-16 h-12 rounded-lg mb-2" />
                      <Skeleton className="w-12 h-6 rounded-lg" />
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <Skeleton className="w-full h-2 rounded-full" />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
            <CardBody className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-96 rounded-lg" />
                <Skeleton className="h-96 rounded-lg" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${BG}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* ✅ REMOVED top Go Back button */}

        {showManagement && (
          <>
            {/* Header Section */}
            <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-white/20">
              <CardBody className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h1
                      className={`text-4xl lg:text-5xl font-black bg-gradient-to-r ${TITLE_GRADIENT} bg-clip-text text-transparent mb-2`}
                    >
                      Unahon Dashboard
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Comprehensive overview of assessment data and analytics
                    </p>
                  </div>

                  {/* Actions (Go Back beside Unahon Form) */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    {!isResponderView && (
                    <Button
                      as={Link}
                      href="/overview/unahon"
                      variant="bordered"
                      startContent={<ArrowLeft className="w-4 h-4" />}
                      className={GO_BACK}
                    >
                      Go Back
                    </Button>
                    )}

                    <Button
                      className={`font-bold ${BTN} text-white min-w-[180px] h-12 ${BTN_MOTION}`}
                      size="lg"
                      onPress={() => router.push('/unahon/form')}
                      endContent={<FileText className="w-5 h-5" />}
                    >
                      Unahon Form
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Summary Cards */}
            {summary && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div
                    className={`w-1 h-8 bg-gradient-to-b ${ACCENT_BAR} rounded-full`}
                  />
                  Assessment Summary
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
  {
    name: 'Red Assessments',
    label: 'Critical Attention',
    value: summary.redCount,
    icon: BellRing,

    // IRSOverview-style card
    cardBg: 'bg-gradient-to-br from-red-500/15 via-red-500/10 to-red-500/5 to-white/60',
    cardBorder: 'border border-red-500/20',

    // IRSOverview-style icon wrapper
    iconBg: 'bg-red-500/25',
    iconColor: 'text-red-600',

    // IRSOverview-style bar
    barTrack: 'bg-red-500/15',
    barFill: 'bg-red-500',
  },
  {
    name: 'Yellow Assessments',
    label: 'Needs Attention',
    value: summary.yellowCount,
    icon: AlertTriangle,

    cardBg: 'bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-amber-500/5 to-white/60',
    cardBorder: 'border border-amber-500/20',

    iconBg: 'bg-amber-500/25',
    iconColor: 'text-amber-600',

    barTrack: 'bg-amber-500/15',
    barFill: 'bg-amber-500',
  },
  {
    name: 'Green Assessments',
    label: 'Minimal Attention',
    value: summary.greenCount,
    icon: ShieldCheck,

    cardBg: 'bg-gradient-to-br from-green-500/15 via-green-500/10 to-green-500/5 to-white/60',
    cardBorder: 'border border-green-500/20',

    iconBg: 'bg-green-500/25',
    iconColor: 'text-green-600',

    barTrack: 'bg-green-500/15',
    barFill: 'bg-green-500',
  },
  {
    name: 'No Assessments',
    label: 'No Data',
    value: summary.noneCount,
    icon: FileText,

    cardBg: 'bg-gradient-to-br from-slate-500/12 via-slate-500/8 to-slate-500/5 to-white/60',
    cardBorder: 'border border-slate-500/20',

    iconBg: 'bg-slate-500/20',
    iconColor: 'text-slate-700',

    barTrack: 'bg-slate-500/15',
    barFill: 'bg-slate-500',
  },
]
.map(
                    (
                      { name, label, value, cardBg, cardBorder, iconBg, iconColor, barTrack, barFill, icon: Icon },
                      index
                    ) => (
                      <Card
                        key={index}
                        className={`shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 
${cardBg} ${cardBorder} 
ring-2 ring-white/70`}

                      >

                        <CardBody className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl ${iconBg} shadow-md`}>
                              <Icon className={`w-5 h-5 ${iconColor}`} />
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-black">
                                {name}
                              </h3>
                              <p className="text-sm text-black">{label}</p>
                            </div>
                          </div>

                          <div className="mb-3">
                            <span className="text-4xl font-bold text-slate-900">
                              {value}
                            </span>
                            <span className="text-lg text-black ml-2">
                              forms
                            </span>
                          </div>

                          <div className={`w-full rounded-full h-2 overflow-hidden ${barTrack}`}>
                            <div
                              className={`h-2 rounded-full ${barFill} transition-all duration-500`}
                              style={{
                                width: `${Math.min(
                                  (value /
                                    Math.max(
                                      summary.redCount +
                                        summary.yellowCount +
                                        summary.greenCount +
                                        summary.noneCount,
                                      1
                                    )) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </CardBody>
                      </Card>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Charts Section */}
                        {/* Charts Section */}
            {(summary || true) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div
                    className={`w-1 h-8 bg-gradient-to-b ${ACCENT_BAR} rounded-full`}
                  />
                  Assessment Distribution
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Assessment Type */}
                  <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center">
                      <h3 className="w-full text-xl font-bold text-slate-800 text-center">
                        Assessment Type
                      </h3>
                    </CardHeader>

                    <CardBody className="p-6">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              {
                                name: 'Initial',
                                value: displaySummary.initialAssessment,
                              },
                              {
                                name: 'Reassessment',
                                value: displaySummary.reassessment,
                              },
                            ]}
                            layout="vertical"
                            margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
                          >
                            <defs>
                              {/* 3D-ish gradients */}
                              <linearGradient id="gradInitial" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.25)" />
                                <stop offset="55%" stopColor="rgba(245, 158, 11, 0.65)" />
                                <stop offset="100%" stopColor="rgba(245, 158, 11, 0.95)" />
                              </linearGradient>

                              <linearGradient id="gradReassess" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
                                <stop offset="55%" stopColor="rgba(59, 130, 246, 0.65)" />
                                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.95)" />
                              </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />

                            <XAxis type="number" tick={{ fill: '#334155' }} axisLine={false} tickLine={false} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={140}
                              tick={{ fill: '#334155' }}
                              axisLine={false}
                              tickLine={false}
                            />


                            <Tooltip
                              formatter={(value) => [`${value}`, 'Count']}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(185, 28, 28, 0.20)',
                                borderRadius: '10px',
                                boxShadow: '0 10px 18px -10px rgba(0, 0, 0, 0.20)',
                              }}
                            />

                            <Bar
                              dataKey="value"
                              radius={[10, 10, 10, 10]}
                              barSize={18}
                              style={{
                                filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.18))',
                              }}
                            >
                              {/* Choose gradient per row */}
                              <Cell fill="url(#gradInitial)" />
                              <Cell fill="url(#gradReassess)" />

                              {/* show number at end */}
                              <LabelList
                                dataKey="value"
                                position="right"
                                style={{ fill: '#111827', fontWeight: 600 }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Assessment Level */}
                  <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center">
                      <h3 className="w-full text-xl font-bold text-slate-800 text-center">
                        Assessment Level
                      </h3>
                    </CardHeader>

                    <CardBody className="p-6">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Red', value: displaySummary.redCount },
                              { name: 'Yellow', value: displaySummary.yellowCount },
                              { name: 'Green', value: displaySummary.greenCount },
                              { name: 'None', value: displaySummary.noneCount },
                            ]}
                            layout="vertical"
                            margin={{ top: 10, right: 40, left: 10, bottom: 10 }}
                          >
                            <defs>
                              <linearGradient id="gradRed" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.25)" />
                                <stop offset="55%" stopColor="rgba(239, 68, 68, 0.65)" />
                                <stop offset="100%" stopColor="rgba(239, 68, 68, 0.95)" />
                              </linearGradient>

                              <linearGradient id="gradYellow" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.25)" />
                                <stop offset="55%" stopColor="rgba(245, 158, 11, 0.65)" />
                                <stop offset="100%" stopColor="rgba(245, 158, 11, 0.95)" />
                              </linearGradient>

                              <linearGradient id="gradGreen" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="rgba(34, 197, 94, 0.25)" />
                                <stop offset="55%" stopColor="rgba(34, 197, 94, 0.65)" />
                                <stop offset="100%" stopColor="rgba(34, 197, 94, 0.95)" />
                              </linearGradient>

                              <linearGradient id="gradNone" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="rgba(100, 116, 139, 0.20)" />
                                <stop offset="55%" stopColor="rgba(100, 116, 139, 0.55)" />
                                <stop offset="100%" stopColor="rgba(100, 116, 139, 0.85)" />
                              </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />

                            <XAxis type="number" tick={{ fill: '#334155' }} axisLine={false} tickLine={false} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              tick={{ fill: '#334155' }}
                              axisLine={false}
                              tickLine={false}
                              width={90}
                            />

                            <Tooltip
                              formatter={(value) => [`${value}`, 'Count']}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(185, 28, 28, 0.20)',
                                borderRadius: '10px',
                                boxShadow: '0 10px 18px -10px rgba(0, 0, 0, 0.20)',
                              }}
                            />

                            <Bar
                              dataKey="value"
                              radius={[10, 10, 10, 10]}
                              barSize={18}
                              style={{
                                filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.18))',
                              }}
                            >
                              <Cell fill="url(#gradRed)" />
                              <Cell fill="url(#gradYellow)" />
                              <Cell fill="url(#gradGreen)" />
                              <Cell fill="url(#gradNone)" />

                              <LabelList
                                dataKey="value"
                                position="right"
                                style={{ fill: '#111827', fontWeight: 600 }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}

        
      </div>
    </div>
  );
};

export default Unahon;
