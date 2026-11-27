import { useEffect, useState } from 'react';
import { Check, Copy, Download, RotateCcw, Trash2, X } from 'lucide-react';
import {
  AnalysisResult,
  DOMAINS,
  DOMAIN_MISSIONS,
  DOMAIN_SOLUTIONS,
  DomainKey,
  PRECISION_TYPES,
  SEGMENT_META,
  Segment,
  SliderValues,
  SolutionGuide,
  WishlistGoal,
  computeSimulatorMetrics,
} from '../data/spendingData';
import { exportReportCardPng } from '../utils/exportReportImage';
import { RadarChart } from './RadarChart';
import { SavingsSimulator } from './SavingsSimulator';

interface ResultDossierProps {
  segment: Segment;
  analysis: AnalysisResult;
  missionsChecked: boolean[];
  onToggleMission: (idx: number) => void;
  sliders: SliderValues;
  onChangeSliders: (next: SliderValues) => void;
  wishlist: WishlistGoal;
  onChangeWishlist: (next: WishlistGoal) => void;
  onRetakeQuiz: () => void;
  onResetAll: () => void;
  onNotify: (msg: string) => void;
}

export function ResultDossier({
  segment,
  analysis,
  missionsChecked,
  onToggleMission,
  sliders,
  onChangeSliders,
  wishlist,
  onChangeWishlist,
  onRetakeQuiz,
  onResetAll,
  onNotify,
}: ResultDossierProps) {
  const [activeGuide, setActiveGuide] = useState<SolutionGuide | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveGuide(null);
    };
    if (activeGuide) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeGuide]);

  const pType = PRECISION_TYPES[analysis.primaryTypeKey];
  const segMeta = SEGMENT_META[segment];
  const simMetrics = computeSimulatorMetrics(segment, sliders, wishlist);

  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (analysis.totalScore / 100) * ringCircumference;

  let gradeComment = '지출 통제 시스템 리모델링이 시급합니다.';
  let scoreToneColor = '#B43C32';
  let gradeTag = '개선 시급';
  if (analysis.totalScore >= 82) {
    gradeComment = '최상위권의 탄탄한 소비·저축 시스템을 갖추고 있습니다.';
    scoreToneColor = '#1F4E3D';
    gradeTag = '최상위 안정';
  } else if (analysis.totalScore >= 66) {
    gradeComment = '전반적으로 양호하며 취약 영역 1~2개만 보완하면 완성도 높은 상태입니다.';
    scoreToneColor = '#1F4E3D';
    gradeTag = '양호 균형';
  } else if (analysis.totalScore >= 48) {
    gradeComment = '일상 속 습관성 지출 누수가 자산 형성을 늦추고 있습니다.';
    scoreToneColor = '#B5781D';
    gradeTag = '주의 관찰';
  }

  const weakKeys = new Set(analysis.weakTop2.map((w) => w.key));
  const [w1, w2] = analysis.weakTop2;
  const worstItem1 = w1.relatedItems[0];
  const worstItem2 = w2.relatedItems[0];

  const dynamicMissions = [
    ...DOMAIN_MISSIONS[w1.key].map((text) => ({ domain: w1.short, text })),
    ...DOMAIN_MISSIONS[w2.key].map((text) => ({ domain: w2.short, text })),
  ];
  const completedMissionCount = missionsChecked.filter(Boolean).length;

  const chosenSolutionKeys: DomainKey[] = [w1.key, w2.key];
  const fallbackOrder: DomainKey[] = ['saving', 'plan', 'fixed', 'micro', 'impulse', 'value'];
  for (const key of fallbackOrder) {
    if (!chosenSolutionKeys.includes(key)) {
      chosenSolutionKeys.push(key);
      break;
    }
  }
  const tailoredSolutions = chosenSolutionKeys.map((k) => DOMAIN_SOLUTIONS[k]);

  const handleDownloadPng = () => {
    const ok = exportReportCardPng(
      analysis,
      segment,
      simMetrics.yearlyTotal,
      simMetrics.compound3Yr
    );
    if (ok) {
      onNotify('진단 결과 리포트 카드가 PNG 이미지로 저장되었습니다.');
    } else {
      onNotify('이미지 저장에 실패했습니다. 텍스트 복사를 이용해 주세요.');
    }
  };

  const handleCopySummary = async () => {
    const summary =
      `[머니체크 · 12문항 소비 습관 정밀 진단 리포트]\n` +
      `• 진단 그룹: ${segMeta.name}\n` +
      `• 주 유형: ${pType.title}\n` +
      `• 부 성향: ${analysis.subTendencyText}\n` +
      `• 종합 소비 건강 점수: ${analysis.totalScore}점 (상위 ${analysis.topPercentile}%)\n` +
      `• 취약 누수 TOP 2: ${w1.short}(${w1.score}점), ${w2.short}(${w2.score}점)\n` +
      `• 1년 예상 절약액: ${simMetrics.yearlyTotal.toLocaleString('ko-KR')}원 (3년 복리 약 ${simMetrics.compound3Yr.toLocaleString('ko-KR')}원)`;

    try {
      await navigator.clipboard.writeText(summary);
      onNotify('정밀 진단 요약 텍스트를 클립보드에 복사했습니다.');
    } catch {
      onNotify('클립보드 복사를 지원하지 않는 환경입니다.');
    }
  };

  return (
    <section className="max-w-[1160px] mx-auto px-5 sm:px-8 py-10 space-y-8">
      {/* 1. Primary Dossier Header & Radar Visualization */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5DFD3]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534C]">
              <span className="font-semibold text-[#1F4E3D]">개인 정밀 진단 리포트</span>
              <span aria-hidden="true">·</span>
              <span>{segMeta.badge}</span>
              <span aria-hidden="true">·</span>
              <span>{pType.categoryLabel}</span>
            </div>
            <p className="text-sm font-medium text-[#57534C]">
              {analysis.subTendencyText}
            </p>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1E1D1A] [text-wrap:balance]">
              {pType.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-lg bg-[#1E1D1A] hover:bg-[#33312C] text-[#FAF8F3] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>결과 카드 이미지 저장 (PNG)</span>
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] rounded-lg bg-[#FAF8F3] hover:bg-[#F2EFE7] text-[#1E1D1A] border border-[#E5DFD3] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Copy className="w-4 h-4" />
              <span>결과 요약 복사</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-5 flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke="#E5DFD3"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={ringRadius}
                    stroke={scoreToneColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono tabular-nums text-2xl font-bold text-[#1E1D1A] leading-none">
                    {analysis.totalScore}
                  </span>
                  <span className="text-[11px] text-[#7D776C] mt-1">/ 100점</span>
                </div>
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-[#1F4E3D]">
                    종합 소비 건강 점수
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums font-semibold text-[#1E1D1A]">
                    상위 {analysis.topPercentile}% ({gradeTag})
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#1E1D1A] leading-snug">
                  {gradeComment}
                </p>
                <p className="text-xs text-[#7D776C]">{pType.shareRatio}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[15px] text-[#57534C] leading-relaxed">
                {pType.desc}
              </p>
              <div className="pt-3 border-t border-[#E5DFD3] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[#7D776C] mb-1">대표 행동 패턴</span>
                  <span className="font-semibold text-[#1E1D1A] leading-snug block">
                    {pType.keyHabit}
                  </span>
                </div>
                <div>
                  <span className="block text-[#7D776C] mb-1">핵심 개선 처방</span>
                  <span className="font-semibold text-[#1F4E3D] leading-snug block">
                    {pType.prescription}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="font-semibold text-[#1E1D1A]">
                6대 소비 역량 육각형 분포
              </span>
              <span className="text-[#7D776C]">영역별 100점 만점</span>
            </div>
            <RadarChart scores={analysis.domainScores} />
          </div>
        </div>
      </div>

      {/* 2. Domain Scores + Personal Top 2 Leak Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h2 className="font-serif text-xl font-bold text-[#1E1D1A]">
                6대 소비 지표 세부 점수
              </h2>
              <span className="text-xs text-[#7D776C]">낮은 항목 우선 개선</span>
            </div>
            <p className="text-xs text-[#57534C]">
              권장 기준(70점) 대비 보완이 필요한 영역을 우선순위로 표시했습니다.
            </p>
          </div>

          <div className="space-y-4">
            {DOMAINS.map((d) => {
              const sc = analysis.domainScores[d.key];
              const isWeak = weakKeys.has(d.key) && sc < 75;
              const barColor =
                sc >= 80
                  ? 'bg-[#1F4E3D]'
                  : sc < 45
                  ? 'bg-[#B43C32]'
                  : sc < 65
                  ? 'bg-[#B5781D]'
                  : 'bg-[#2D6A54]';
              const statusLabel =
                sc >= 80 ? '우수' : isWeak ? '집중 보완' : sc >= 65 ? '양호' : '보완 권장';

              return (
                <div key={d.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1E1D1A]">{d.short}</span>
                      <span
                        className={`text-xs ${
                          isWeak ? 'text-[#B43C32] font-semibold' : 'text-[#7D776C]'
                        }`}
                      >
                        · {statusLabel}
                      </span>
                    </div>
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        sc < 50 ? 'text-[#B43C32]' : 'text-[#1E1D1A]'
                      }`}
                    >
                      {sc}점
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F2EFE7] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${sc}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-serif text-xl font-bold text-[#1E1D1A]">
              개인 응답 기반 취약 누수 포인트 TOP 2
            </h2>
            <span className="text-xs font-semibold text-[#B43C32]">실제 선택 근거</span>
          </div>

          <p className="text-sm text-[#1E1D1A] bg-[#FBEFED] border border-[#EBCAC6] rounded-xl p-4 leading-relaxed">
            {analysis.totalScore >= 85 && w1.score >= 75 ? (
              <>
                전반적인 소비 방어력이 매우 안정적입니다. 상대적으로 점수가 낮은{' '}
                <strong>{worstItem1.topic}</strong> 및 <strong>{worstItem2.topic}</strong> 항목만
                미세 조정하면 완성도 높은 지출 구조가 됩니다.
              </>
            ) : (
              <>
                12문항 응답 분석 결과, 현재 가장 큰 지출 누수는{' '}
                <strong>{worstItem1.topic}</strong> 및 <strong>{worstItem2.topic}</strong> 영역에서
                발생하고 있습니다.
              </>
            )}
          </p>

          <div className="space-y-3.5">
            {[w1, w2].map((weakObj, idx) => {
              const picked = weakObj.relatedItems[0];
              return (
                <div
                  key={weakObj.key}
                  className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#1E1D1A]">
                      취약 {idx + 1}순위 ·{' '}
                      <span className="text-[#1F4E3D]">
                        {weakObj.short} ({weakObj.score}점)
                      </span>
                    </span>
                    <span className="font-mono text-[#7D776C]">문항 Q{picked.qIndex}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#1E1D1A]">
                    {weakObj.leakTitle}
                  </p>
                  <div className="bg-white border border-[#E5DFD3] rounded-lg p-3 text-xs text-[#57534C] leading-relaxed">
                    <span className="font-semibold text-[#1E1D1A] block mb-0.5">
                      선택한 실제 행동 ({picked.topic})
                    </span>
                    “{picked.selectedText}”
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Chemistry Match + 4 Dynamic Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-7 space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#1E1D1A]">
            소비 유형 케미스트리
          </h2>
          <p className="text-xs text-[#57534C]">
            재무 습관이 서로에게 미치는 시너지와 주의할 조합입니다.
          </p>

          <div className="space-y-3 pt-1">
            <div className="bg-[#EAF1EE] border border-[#C6DBD1] rounded-xl p-4 space-y-1.5">
              <span className="text-xs font-semibold text-[#1F4E3D] block">
                균형을 잡아주는 환상의 메이트
              </span>
              <p className="text-base font-bold text-[#1E1D1A]">
                {pType.bestMatch.name}
              </p>
              <p className="text-xs text-[#57534C] leading-relaxed">
                {pType.bestMatch.desc}
              </p>
            </div>

            <div className="bg-[#F9F2E4] border border-[#E9D7B3] rounded-xl p-4 space-y-1.5">
              <span className="text-xs font-semibold text-[#B5781D] block">
                함께 지출이 커지기 쉬운 메이트
              </span>
              <p className="text-base font-bold text-[#1E1D1A]">
                {pType.worstMatch.name}
              </p>
              <p className="text-xs text-[#57534C] leading-relaxed">
                {pType.worstMatch.desc}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-serif text-xl font-bold text-[#1E1D1A]">
              맞춤 개선 실천 미션 4가지
            </h2>
            <span className="font-mono tabular-nums text-xs font-semibold text-[#1F4E3D]">
              {completedMissionCount} / 4 완료
            </span>
          </div>
          <p className="text-xs text-[#57534C]">
            취약 영역 TOP 2({w1.short}, {w2.short})를 기준으로 자동 선정되었으며 체크 상태가 자동 저장됩니다.
          </p>

          <div className="space-y-2.5 pt-1">
            {dynamicMissions.map((mission, idx) => {
              const checked = Boolean(missionsChecked[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onToggleMission(idx)}
                  className={`w-full text-left p-4 min-h-[54px] rounded-xl border transition-colors flex items-start gap-3.5 cursor-pointer ${
                    checked
                      ? 'bg-[#EAF1EE]/70 border-[#C6DBD1]'
                      : 'bg-[#FAF8F3] border-[#E5DFD3] hover:bg-[#F2EFE7]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      checked
                        ? 'bg-[#1F4E3D] border-[#1F4E3D] text-[#FAF8F3]'
                        : 'bg-white border-[#CFC7B7] text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#1F4E3D] block">
                      {mission.domain} 개선
                    </span>
                    <span
                      className={`text-sm font-medium leading-snug block ${
                        checked ? 'line-through text-[#7D776C]' : 'text-[#1E1D1A]'
                      }`}
                    >
                      {mission.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Calibrated Savings Simulator */}
      <SavingsSimulator
        segment={segment}
        sliders={sliders}
        onChangeSliders={onChangeSliders}
        wishlist={wishlist}
        onChangeWishlist={onChangeWishlist}
        calibratedFromQuiz
        onNotify={onNotify}
      />

      {/* 5. Tailored Top 3 Action Guides */}
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1E1D1A]">
              취약점 맞춤 개선 솔루션 3선
            </h2>
            <p className="text-xs text-[#57534C] mt-1">
              실제 취약 역량 순서에 맞춰 즉시 도입할 수 있는 금융·생활 프로토콜입니다.
            </p>
          </div>
          <span className="text-xs text-[#7D776C]">각 카드에서 3단계 실행 가이드 확인</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tailoredSolutions.map((sol, idx) => (
            <div
              key={sol.key}
              className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#7D776C]">
                  <span className="font-mono font-semibold text-[#1F4E3D]">0{idx + 1}</span>
                  <span>{sol.tag}</span>
                </div>
                <h3 className="text-base font-bold text-[#1E1D1A] leading-snug">
                  {sol.title}
                </h3>
                <p className="text-xs text-[#57534C] leading-relaxed">{sol.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveGuide(sol)}
                className="w-full py-2.5 px-4 min-h-[40px] rounded-lg bg-white hover:bg-[#1F4E3D] text-[#1F4E3D] hover:text-[#FAF8F3] border border-[#E5DFD3] hover:border-[#1F4E3D] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                실행 가이드 보기
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Retake & Reset Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-6">
        <button
          type="button"
          onClick={onRetakeQuiz}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg bg-[#1F4E3D] hover:bg-[#173B2E] text-[#FAF8F3] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          <span>처음부터 다시 진단하기</span>
        </button>

        <button
          type="button"
          onClick={onResetAll}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-lg bg-white hover:bg-[#FBEFED] text-[#57534C] hover:text-[#B43C32] border border-[#E5DFD3] hover:border-[#EBCAC6] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <Trash2 className="w-4 h-4" />
          <span>저장 기록 완전 초기화</span>
        </button>
      </div>

      {/* Solution Protocol Modal */}
      {activeGuide && (
        <div
          className="fixed inset-0 z-50 bg-[#1E1D1A]/50 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-4"
          onClick={() => setActiveGuide(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-guide-title"
        >
          <div
            className="bg-white border border-[#E5DFD3] w-full max-w-[480px] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#1F4E3D] block">
                  {activeGuide.tag}
                </span>
                <h3
                  id="modal-guide-title"
                  className="font-serif text-xl font-bold text-[#1E1D1A] leading-snug"
                >
                  {activeGuide.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuide(null)}
                aria-label="가이드 닫기"
                className="w-9 h-9 rounded-lg bg-[#FAF8F3] hover:bg-[#F2EFE7] border border-[#E5DFD3] text-[#57534C] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[#57534C] leading-relaxed">{activeGuide.desc}</p>

            <div className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-[#1E1D1A]">
                오늘 바로 적용하는 3단계 실천 프로토콜
              </p>
              <ol className="space-y-2.5">
                {activeGuide.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#1E1D1A]">
                    <span className="w-5 h-5 rounded-full bg-[#1F4E3D] text-[#FAF8F3] font-mono text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveGuide(null)}
                className="py-3 px-4 min-h-[44px] rounded-lg bg-[#FAF8F3] hover:bg-[#F2EFE7] border border-[#E5DFD3] text-[#57534C] text-sm font-semibold transition-colors cursor-pointer"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveGuide(null);
                  onNotify('실천 가이드 확인 완료. 오늘 바로 1단계부터 적용해 보세요.');
                }}
                className="py-3 px-4 min-h-[44px] rounded-lg bg-[#1F4E3D] hover:bg-[#173B2E] text-[#FAF8F3] text-sm font-semibold transition-colors cursor-pointer"
              >
                실천 가이드 확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
