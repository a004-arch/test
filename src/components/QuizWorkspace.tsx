import { ArrowLeft, Check } from 'lucide-react';
import { DOMAINS, QUIZ_BANK, SEGMENT_META, Segment } from '../data/spendingData';

interface QuizWorkspaceProps {
  segment: Segment;
  currentStep: number;
  answers: (number | null)[];
  onSelectOption: (optionIndex: number) => void;
  onPrevStep: () => void;
  onExitHome: () => void;
}

const LEVEL_LABELS = ['매우 체계적', '양호한 편', '보통 수준', '주의 필요', '위험 누수'];

export function QuizWorkspace({
  segment,
  currentStep,
  answers,
  onSelectOption,
  onPrevStep,
  onExitHome,
}: QuizWorkspaceProps) {
  const bank = QUIZ_BANK[segment];
  const question = bank[currentStep];
  const domainMeta = DOMAINS.find((d) => d.key === question.domain);
  const segMeta = SEGMENT_META[segment];
  const progressPct = ((currentStep + 1) / bank.length) * 100;

  return (
    <section className="max-w-[780px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
      <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-10">
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#E5DFD3]">
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={onPrevStep}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] -ml-2 rounded-lg text-sm font-medium text-[#57534C] hover:text-[#1E1D1A] hover:bg-[#F2EFE7] transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전 문항</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onExitHome}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] -ml-2 rounded-lg text-sm font-medium text-[#57534C] hover:text-[#1E1D1A] hover:bg-[#F2EFE7] transition-colors cursor-pointer whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>그룹 다시 선택</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#57534C]">
            <span>{segMeta.short}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums font-semibold text-[#1F4E3D]">
              {currentStep + 1} / {bank.length}
            </span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-[#F2EFE7] rounded-full overflow-hidden mt-5 mb-7">
          <div
            className="h-full bg-[#1F4E3D] transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7D776C]">
              <span className="font-semibold text-[#1F4E3D]">
                {domainMeta?.tagLabel}
              </span>
              <span>가장 가까운 실제 행동 1가지를 선택하세요</span>
            </div>

            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1E1D1A] leading-snug [text-wrap:balance]">
              Q{currentStep + 1}. {question.q}
            </h1>
          </div>

          <div className="space-y-3" role="radiogroup" aria-label={question.q}>
            {question.options.map((opt, idx) => {
              const isSelected = answers[currentStep] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onSelectOption(idx)}
                  className={`w-full text-left p-4 sm:p-5 min-h-[56px] rounded-xl border transition-all duration-150 flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4E3D] ${
                    isSelected
                      ? 'border-[#1F4E3D] bg-[#EAF1EE] text-[#1E1D1A]'
                      : 'border-[#E5DFD3] bg-[#FAF8F3]/60 hover:bg-[#F2EFE7] hover:border-[#CFC7B7] text-[#1E1D1A]'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs text-[#57534C]">
                      <span className="font-mono font-semibold">0{idx + 1}</span>
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span className={isSelected ? 'text-[#1F4E3D] font-semibold' : ''}>
                        {LEVEL_LABELS[idx]}
                      </span>
                    </p>
                    <p className="text-sm sm:text-[15px] font-medium leading-relaxed">
                      {opt.text}
                    </p>
                  </div>

                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 text-xs font-semibold border transition-colors ${
                      isSelected
                        ? 'bg-[#1F4E3D] border-[#1F4E3D] text-[#FAF8F3]'
                        : 'bg-white border-[#CFC7B7] text-[#7D776C]'
                    }`}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
