import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { QuizWorkspace } from './components/QuizWorkspace';
import { RadarChart } from './components/RadarChart';
import { ResultDossier } from './components/ResultDossier';
import { SavingsSimulator } from './components/SavingsSimulator';
import {
  AppState,
  DOMAINS,
  DomainKey,
  PRECISION_TYPES,
  PrecisionType,
  SEGMENT_META,
  STORAGE_KEY,
  Segment,
  SliderValues,
  TYPE_SAMPLE_PROFILES,
  WishlistGoal,
  deriveInitialSlidersFromAnswers,
  runPrecisionEngine,
} from './data/spendingData';

type ViewMode = 'home' | 'quiz' | 'result';
type PreviewMode = 'sample_leak' | 'sample_balanced' | 'saved_user';

const DEFAULT_STATE: AppState = {
  segment: 'student',
  completedSegment: 'student',
  completed: false,
  answers: new Array(12).fill(null),
  draftStep: 0,
  draftAnswers: new Array(12).fill(null),
  missionsChecked: [false, false, false, false],
  sliders: { cafe: 2, delivery: 1, impulse: 2, fixed: 2, micro: 2 },
  wishlist: { title: '아이패드 에어', amount: 900000 },
};

const SAMPLE_PREVIEW_PROFILES: Record<
  'sample_leak' | 'sample_balanced',
  { label: string; title: string; score: number; scores: Record<DomainKey, number> }
> = {
  sample_leak: {
    label: '샘플 · 소확행 누수형',
    title: '가랑비에 옷 젖는 소확행 수집가',
    score: 54,
    scores: { plan: 60, impulse: 62, micro: 28, fixed: 65, value: 55, saving: 46 },
  },
  sample_balanced: {
    label: '샘플 · 스마트 실속파',
    title: '밸런스 잡힌 스마트 실속파',
    score: 76,
    scores: { plan: 78, impulse: 74, micro: 60, fixed: 76, value: 82, saving: 74 },
  },
};

const TYPE_IDS: PrecisionType['id'][] = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const segment: Segment = parsed.segment === 'worker' ? 'worker' : 'student';
    const completedSegment: Segment =
      parsed.completedSegment === 'worker'
        ? 'worker'
        : parsed.completedSegment === 'student'
        ? 'student'
        : segment;
    return {
      segment,
      completedSegment,
      completed: Boolean(parsed.completed),
      answers:
        Array.isArray(parsed.answers) && parsed.answers.length === 12
          ? parsed.answers
          : new Array(12).fill(null),
      draftStep:
        typeof parsed.draftStep === 'number' &&
        parsed.draftStep >= 0 &&
        parsed.draftStep <= 11
          ? parsed.draftStep
          : 0,
      draftAnswers:
        Array.isArray(parsed.draftAnswers) && parsed.draftAnswers.length === 12
          ? parsed.draftAnswers
          : new Array(12).fill(null),
      missionsChecked:
        Array.isArray(parsed.missionsChecked) && parsed.missionsChecked.length === 4
          ? parsed.missionsChecked
          : [false, false, false, false],
      sliders: { ...DEFAULT_STATE.sliders, ...(parsed.sliders || {}) },
      wishlist: { ...DEFAULT_STATE.wishlist, ...(parsed.wishlist || {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadInitialState());
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedArchiveType, setSelectedArchiveType] = useState<PrecisionType['id']>('T2');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('sample_leak');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch {
      // Ignore storage quota errors
    }
  }, [appState]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2600);
  }, []);

  const savedAnalysis = useMemo(() => {
    if (!appState.completed || appState.answers.some((a) => a === null)) return null;
    return runPrecisionEngine(appState.completedSegment, appState.answers);
  }, [appState.completed, appState.completedSegment, appState.answers]);

  const draftAnsweredCount = useMemo(
    () => appState.draftAnswers.filter((a) => a !== null).length,
    [appState.draftAnswers]
  );

  const scrollToSection = (sectionId: string) => {
    if (viewMode !== 'home') {
      setViewMode('home');
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartQuiz = () => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setAppState((prev) => ({
      ...prev,
      draftStep: 0,
      draftAnswers: new Array(12).fill(null),
    }));
    setViewMode('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeDraftQuiz = () => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setViewMode('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditQuestionFromResult = (qIdxZeroBased: number) => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    setAppState((prev) => ({
      ...prev,
      segment: prev.completedSegment,
      draftStep: Math.max(0, Math.min(11, qIdxZeroBased)),
      draftAnswers: [...prev.answers],
    }));
    setViewMode('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalizeDraftToResult = (finalAnswers: (number | null)[]) => {
    const analysis = runPrecisionEngine(appState.segment, finalAnswers);
    const calibratedSliders = deriveInitialSlidersFromAnswers(
      finalAnswers,
      analysis.domainScores
    );
    setAppState((prev) => ({
      ...prev,
      answers: finalAnswers,
      completedSegment: prev.segment,
      completed: true,
      draftStep: 0,
      draftAnswers: new Array(12).fill(null),
      missionsChecked: [false, false, false, false],
      sliders: calibratedSliders,
    }));
    setViewMode('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (optIndex: number) => {
    const nextDraft = [...appState.draftAnswers];
    nextDraft[appState.draftStep] = optIndex;

    if (appState.draftStep < 11) {
      setAppState((prev) => ({ ...prev, draftAnswers: nextDraft }));
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = window.setTimeout(() => {
        setAppState((prev) => ({
          ...prev,
          draftStep: Math.min(11, prev.draftStep + 1),
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 180);
    } else {
      setAppState((prev) => ({ ...prev, draftAnswers: nextDraft }));
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = window.setTimeout(() => {
        finalizeDraftToResult(nextDraft);
      }, 190);
    }
  };

  const handleToggleMission = (idx: number) => {
    setAppState((prev) => {
      const next = [...prev.missionsChecked];
      next[idx] = !next[idx];
      return { ...prev, missionsChecked: next };
    });
  };

  const handleUpdateSliders = (sliders: SliderValues) => {
    setAppState((prev) => ({ ...prev, sliders }));
  };

  const handleUpdateWishlist = (wishlist: WishlistGoal) => {
    setAppState((prev) => ({ ...prev, wishlist }));
  };

  const handleResetAll = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setAppState(DEFAULT_STATE);
    setPreviewMode('sample_leak');
    setViewMode('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('저장된 모든 진단 기록과 시뮬레이터 설정을 초기화했습니다.');
  };

  const activeArchive = PRECISION_TYPES[selectedArchiveType];
  const activeArchiveProfile = TYPE_SAMPLE_PROFILES[selectedArchiveType];
  const savedPrimaryType = savedAnalysis
    ? PRECISION_TYPES[savedAnalysis.primaryTypeKey]
    : null;

  const effectivePreviewMode: PreviewMode =
    previewMode === 'saved_user' && !savedAnalysis ? 'sample_leak' : previewMode;

  const activePreviewData =
    effectivePreviewMode === 'saved_user' && savedAnalysis && savedPrimaryType
      ? {
          title: savedPrimaryType.title,
          score: savedAnalysis.totalScore,
          scores: savedAnalysis.domainScores,
          badgeText: `${SEGMENT_META[appState.completedSegment].badge} · 내 측정 결과`,
        }
      : {
          title:
            SAMPLE_PREVIEW_PROFILES[
              effectivePreviewMode === 'sample_balanced'
                ? 'sample_balanced'
                : 'sample_leak'
            ].title,
          score:
            SAMPLE_PREVIEW_PROFILES[
              effectivePreviewMode === 'sample_balanced'
                ? 'sample_balanced'
                : 'sample_leak'
            ].score,
          scores:
            SAMPLE_PREVIEW_PROFILES[
              effectivePreviewMode === 'sample_balanced'
                ? 'sample_balanced'
                : 'sample_leak'
            ].scores,
          badgeText: `${SEGMENT_META[appState.segment].badge} · 미리보기`,
        };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#1E1D1A]">
      <Header
        activeView={viewMode}
        onGoHome={() => {
          setViewMode('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartQuiz={handleStartQuiz}
        onNavigateSection={scrollToSection}
      />

      <main className="flex-1">
        {viewMode === 'home' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22 }}
          >
            {/* Hero Section */}
            <section
              id="hero"
              className="max-w-[1160px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                {/* Left Column: Proposition & Segment Selection */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm font-medium text-[#57534C]">
                      소비 습관 테스트 · 6대 역량 분석 · 맞춤 지출 개선
                    </p>

                    <h1 className="font-serif text-[32px] sm:text-[44px] lg:text-[48px] font-bold leading-[1.22] tracking-tight text-[#1E1D1A] [text-wrap:balance]">
                      내 지갑의 빈틈을 읽어내는
                      <br />
                      소비 습관 정밀 진단과 개선
                    </h1>

                    <p className="text-[15px] sm:text-base text-[#57534C] leading-relaxed max-w-[60ch]">
                      12가지 실제 생활 문항으로 나의 소비 건강 점수와 주·부 유형을 진단하고, 응답 데이터에 기반한 지출 누수 TOP 2와 3년 복리 절약 플랜까지 한 번에 설계합니다.
                    </p>
                  </div>

                  {/* Saved Report or In-Progress Draft Resume Bar */}
                  {(savedAnalysis && savedPrimaryType) || draftAnsweredCount > 0 ? (
                    <div className="space-y-2.5">
                      {savedAnalysis && savedPrimaryType && (
                        <div className="bg-[#F2EFE7] border border-[#E5DFD3] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-semibold text-[#1F4E3D]">
                              저장된 진단 리포트 이어보기
                            </p>
                            <p className="text-sm font-semibold text-[#1E1D1A] truncate">
                              {savedPrimaryType.title} · 종합{' '}
                              <span className="font-mono tabular-nums">
                                {savedAnalysis.totalScore}점
                              </span>{' '}
                              (상위 {savedAnalysis.topPercentile}%)
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setViewMode('result');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-4 py-2 min-h-[40px] rounded-lg bg-white hover:bg-[#FAF8F3] border border-[#E5DFD3] text-xs sm:text-sm font-semibold text-[#1E1D1A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            리포트 열기
                          </button>
                        </div>
                      )}

                      {draftAnsweredCount > 0 && draftAnsweredCount < 12 && (
                        <div className="bg-[#EAF1EE] border border-[#C6DBD1] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                          <span className="text-xs sm:text-sm font-medium text-[#1E1D1A]">
                            작성 중인 진단이 있습니다 ({draftAnsweredCount}/12문항 응답 완료)
                          </span>
                          <button
                            type="button"
                            onClick={handleResumeDraftQuiz}
                            className="text-xs sm:text-sm font-semibold text-[#1F4E3D] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                          >
                            계속 풀기 →
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Step 1: Segment Switch + Primary CTA */}
                  <div className="bg-white border border-[#E5DFD3] rounded-2xl p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1E1D1A]">
                        01. 현재 라이프스타일 그룹 선택
                      </span>
                      <span className="text-[#7D776C]">그룹별 맞춤 문항 및 단가 적용</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(['student', 'worker'] as Segment[]).map((seg) => {
                        const meta = SEGMENT_META[seg];
                        const isSelected = appState.segment === seg;
                        return (
                          <button
                            key={seg}
                            type="button"
                            onClick={() =>
                              setAppState((prev) => ({ ...prev, segment: seg }))
                            }
                            className={`text-left p-4 min-h-[84px] rounded-xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'bg-[#EAF1EE] border-[#1F4E3D]'
                                : 'bg-[#FAF8F3] border-[#E5DFD3] hover:bg-[#F2EFE7]'
                            }`}
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-[#1E1D1A]">
                                {meta.name}
                              </p>
                              <p className="text-xs text-[#57534C] leading-snug">
                                {meta.description}
                              </p>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                                isSelected
                                  ? 'bg-[#1F4E3D] border-[#1F4E3D] text-[#FAF8F3]'
                                  : 'bg-white border-[#CFC7B7] text-transparent'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="w-full py-3.5 px-6 min-h-[48px] rounded-xl bg-[#1F4E3D] hover:bg-[#173B2E] text-[#FAF8F3] text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <span>
                        {SEGMENT_META[appState.segment].short} 12문항 정밀 진단 시작하기
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Column: Interactive Live Diagnostic Preview */}
                <div className="lg:col-span-5 bg-white border border-[#E5DFD3] rounded-2xl p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3 pb-4 border-b border-[#E5DFD3]">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#7D776C]">
                      <span>{activePreviewData.badgeText}</span>
                      <span className="font-mono tabular-nums font-semibold text-[#1F4E3D]">
                        {activePreviewData.score} / 100점
                      </span>
                    </div>

                    <p className="font-serif text-lg font-bold text-[#1E1D1A]">
                      {activePreviewData.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F2EFE7] border border-[#E5DFD3] rounded-lg">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('sample_leak')}
                        className={`flex-1 px-2.5 py-1.5 min-h-[34px] rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          effectivePreviewMode === 'sample_leak'
                            ? 'bg-white text-[#1E1D1A] border border-[#E5DFD3]'
                            : 'text-[#57534C] hover:text-[#1E1D1A]'
                        }`}
                      >
                        소확행 누수형
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('sample_balanced')}
                        className={`flex-1 px-2.5 py-1.5 min-h-[34px] rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          effectivePreviewMode === 'sample_balanced'
                            ? 'bg-white text-[#1E1D1A] border border-[#E5DFD3]'
                            : 'text-[#57534C] hover:text-[#1E1D1A]'
                        }`}
                      >
                        스마트 실속파
                      </button>
                      {savedAnalysis && (
                        <button
                          type="button"
                          onClick={() => setPreviewMode('saved_user')}
                          className={`flex-1 px-2.5 py-1.5 min-h-[34px] rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                            effectivePreviewMode === 'saved_user'
                              ? 'bg-white text-[#1F4E3D] border border-[#E5DFD3]'
                              : 'text-[#57534C] hover:text-[#1E1D1A]'
                          }`}
                        >
                          내 리포트
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl py-4 px-3">
                    <RadarChart scores={activePreviewData.scores} compact />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#F2EFE7]/70 rounded-lg p-3">
                      <span className="text-[#7D776C] block mb-0.5">도출 결과</span>
                      <span className="font-semibold text-[#1E1D1A]">
                        주 유형 · 부 성향 · 누수 TOP 2
                      </span>
                    </div>
                    <div className="bg-[#F2EFE7]/70 rounded-lg p-3">
                      <span className="text-[#7D776C] block mb-0.5">개선 처방</span>
                      <span className="font-semibold text-[#1F4E3D]">
                        맞춤 미션 4종 · 3년 복리 계산
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Column Quantitative Specification Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10 pt-8 border-t border-[#E5DFD3]">
                <div className="space-y-1">
                  <p className="font-mono tabular-nums text-lg font-bold text-[#1E1D1A]">
                    12문항 × 5지선다
                  </p>
                  <p className="text-xs text-[#57534C]">
                    체계적 관리부터 위험 누수까지 5단계 정밀 측정
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono tabular-nums text-lg font-bold text-[#1F4E3D]">
                    6대 소비 지표
                  </p>
                  <p className="text-xs text-[#57534C]">
                    예산·충동·소액·고정비·가성비·저축 균형 분석
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono tabular-nums text-lg font-bold text-[#1E1D1A]">
                    6종 소비 유형
                  </p>
                  <p className="text-xs text-[#57534C]">
                    결핍 가중치 기반 주 유형 및 부 성향 결합 도출
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-mono tabular-nums text-lg font-bold text-[#B5781D]">
                    3년 연 4% 복리
                  </p>
                  <p className="text-xs text-[#57534C]">
                    응답 비례 절약 시뮬레이터 및 위시리스트 달성 계산
                  </p>
                </div>
              </div>
            </section>

            {/* Section 01: 6 Core Spending Indicators */}
            <section
              id="indicators"
              className="border-t border-[#E5DFD3] bg-[#F2EFE7]/45 py-16"
            >
              <div className="max-w-[1160px] mx-auto px-5 sm:px-8 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <p className="text-xs font-semibold text-[#1F4E3D]">
                      01 · 다차원 평가 기준
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1D1A] [text-wrap:balance]">
                      지출의 원인을 입체적으로 읽어내는 6대 소비 지표
                    </h2>
                  </div>
                  <p className="text-sm text-[#57534C] max-w-md leading-relaxed">
                    단순히 돈을 많이 쓰는지 적게 쓰는지보다, 어느 지점에서 통제력이 느슨해지는지 6개 축으로 분해해 진단합니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DOMAINS.map((domain) => (
                    <div
                      key={domain.key}
                      className="bg-white border border-[#E5DFD3] rounded-xl p-6 space-y-2.5 hover:border-[#CFC7B7] transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-[#7D776C]">
                        <span className="font-mono font-semibold text-[#1F4E3D]">
                          {domain.index}
                        </span>
                        <span>100점 만점 기준</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#1E1D1A]">{domain.short}</h3>
                      <p className="text-sm text-[#57534C] leading-relaxed">
                        {domain.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 02: 6 Spending Types Interactive Archive */}
            <section id="types" className="py-16 border-t border-[#E5DFD3]">
              <div className="max-w-[1160px] mx-auto px-5 sm:px-8 space-y-8">
                <div className="space-y-2 max-w-xl">
                  <p className="text-xs font-semibold text-[#1F4E3D]">
                    02 · 소비 유형 아카이브
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1D1A] [text-wrap:balance]">
                    진단으로 도출되는 6가지 소비 성향과 개선 처방
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-5 space-y-2">
                    {TYPE_IDS.map((id) => {
                      const t = PRECISION_TYPES[id];
                      const active = selectedArchiveType === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setSelectedArchiveType(id)}
                          className={`w-full text-left px-5 py-4 min-h-[58px] rounded-xl border transition-colors flex items-center justify-between gap-4 cursor-pointer ${
                            active
                              ? 'bg-[#1E1D1A] border-[#1E1D1A] text-[#FAF8F3]'
                              : 'bg-white border-[#E5DFD3] hover:bg-[#F2EFE7] text-[#1E1D1A]'
                          }`}
                        >
                          <div className="min-w-0">
                            <span
                              className={`text-xs font-mono block mb-0.5 ${
                                active ? 'text-[#E7C888]' : 'text-[#7D776C]'
                              }`}
                            >
                              {t.index} · {t.categoryLabel}
                            </span>
                            <span className="text-base font-bold truncate block">
                              {t.title}
                            </span>
                          </div>
                          <span
                            className={`text-xs shrink-0 ${
                              active ? 'text-[#8CE0B8]' : 'text-[#7D776C]'
                            }`}
                          >
                            상세 보기
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="lg:col-span-7 bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534C] pb-4 border-b border-[#E5DFD3]">
                        <span className="font-semibold text-[#1F4E3D]">
                          유형 {activeArchive.index} · {activeArchive.categoryLabel}
                        </span>
                        <span>{activeArchive.shareRatio}</span>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-sm font-medium text-[#7D776C]">
                          {activeArchive.subPhrase}
                        </p>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1D1A]">
                          {activeArchive.title}
                        </h3>
                      </div>

                      <p className="text-[15px] text-[#57534C] leading-relaxed">
                        {activeArchive.desc}
                      </p>

                      {/* 6-Axis Typical Profile Snapshot */}
                      <div className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#1E1D1A]">
                            대표 6대 지표 프로파일
                          </span>
                          <span className="text-[#7D776C]">전형적 분포 기준</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                          {DOMAINS.map((dom) => {
                            const val = activeArchiveProfile[dom.key];
                            const barBg =
                              val >= 75
                                ? 'bg-[#1F4E3D]'
                                : val < 40
                                ? 'bg-[#B43C32]'
                                : 'bg-[#B5781D]';
                            return (
                              <div key={dom.key} className="space-y-1">
                                <div className="flex items-center justify-between text-[11.5px]">
                                  <span className="text-[#57534C]">{dom.short}</span>
                                  <span className="font-mono tabular-nums font-semibold text-[#1E1D1A]">
                                    {val}점
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-[#E5DFD3] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${barBg} rounded-full transition-all duration-300`}
                                    style={{ width: `${val}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-4 space-y-1">
                          <span className="text-xs text-[#7D776C] block">
                            주요 누수 패턴
                          </span>
                          <p className="text-sm font-semibold text-[#1E1D1A] leading-snug">
                            {activeArchive.keyHabit}
                          </p>
                        </div>
                        <div className="bg-[#EAF1EE] border border-[#C6DBD1] rounded-xl p-4 space-y-1">
                          <span className="text-xs font-semibold text-[#1F4E3D] block">
                            권장 개선 처방
                          </span>
                          <p className="text-sm font-semibold text-[#1E1D1A] leading-snug">
                            {activeArchive.prescription}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-xs text-[#57534C]">
                        환상의 메이트:{' '}
                        <strong className="text-[#1E1D1A]">
                          {activeArchive.bestMatch.name}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartQuiz}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-lg bg-[#1F4E3D] hover:bg-[#173B2E] text-[#FAF8F3] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <span>내 소비 유형 테스트하기</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 03: Standalone Interactive Savings Simulator */}
            <section
              id="simulator"
              className="border-t border-[#E5DFD3] bg-[#F2EFE7]/45 py-16"
            >
              <div className="max-w-[1160px] mx-auto px-5 sm:px-8 space-y-6">
                <div className="space-y-2 max-w-xl">
                  <p className="text-xs font-semibold text-[#1F4E3D]">
                    03 · 지출 개선 시뮬레이션
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1D1A] [text-wrap:balance]">
                    줄인 소비가 3년 뒤 얼마가 되는지 미리 계산해 보세요
                  </h2>
                </div>

                <SavingsSimulator
                  segment={appState.segment}
                  onChangeSegment={(seg) =>
                    setAppState((prev) => ({ ...prev, segment: seg }))
                  }
                  sliders={appState.sliders}
                  onChangeSliders={handleUpdateSliders}
                  wishlist={appState.wishlist}
                  onChangeWishlist={handleUpdateWishlist}
                  onNotify={showToast}
                />
              </div>
            </section>
          </motion.div>
        )}

        {viewMode === 'quiz' && (
          <QuizWorkspace
            segment={appState.segment}
            currentStep={appState.draftStep}
            answers={appState.draftAnswers}
            onSelectOption={handleSelectOption}
            onJumpStep={(stepIndex) =>
              setAppState((prev) => ({ ...prev, draftStep: stepIndex }))
            }
            onPrevStep={() =>
              setAppState((prev) => ({
                ...prev,
                draftStep: Math.max(0, prev.draftStep - 1),
              }))
            }
            onNextStep={() =>
              setAppState((prev) => ({
                ...prev,
                draftStep: Math.min(11, prev.draftStep + 1),
              }))
            }
            onFinishQuiz={() => finalizeDraftToResult(appState.draftAnswers)}
            onExitHome={() => setViewMode('home')}
          />
        )}

        {viewMode === 'result' && savedAnalysis && (
          <ResultDossier
            segment={appState.completedSegment}
            analysis={savedAnalysis}
            missionsChecked={appState.missionsChecked}
            onToggleMission={handleToggleMission}
            sliders={appState.sliders}
            onChangeSliders={handleUpdateSliders}
            wishlist={appState.wishlist}
            onChangeWishlist={handleUpdateWishlist}
            onEditQuestion={handleEditQuestionFromResult}
            onRetakeQuiz={handleStartQuiz}
            onResetAll={handleResetAll}
            onNotify={showToast}
          />
        )}
      </main>

      <Footer
        onNavigateSection={scrollToSection}
        onStartQuiz={handleStartQuiz}
      />

      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1E1D1A] text-[#FAF8F3] text-xs sm:text-sm font-medium px-5 py-3 rounded-xl shadow-lg border border-white/15 flex items-center gap-2.5 whitespace-nowrap max-w-[90vw] truncate"
        >
          <Check className="w-4 h-4 text-[#8CE0B8] shrink-0" />
          <span className="truncate">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
