import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { DOMAINS, QUIZ_BANK, SEGMENT_META, Segment } from '../data/spendingData';

interface QuizWorkspaceProps {
  segment: Segment;
  currentStep: number;
  answers: (number | null)[];
  onSelectOption: (optionIndex: number) => void;
  onJumpStep: (stepIndex: number) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onFinishQuiz: () => void;
  onExitHome: () => void;
}

const LEVEL_LABELS = ['매우 체계적', '양호한 편', '보통 수준', '주의 필요', '위험 누수'];

export function QuizWorkspace({
  segment,
  currentStep,
  answers,
  onSelectOption,
  onJumpStep,
  onPrevStep,
  onNextStep,
  onFinishQuiz,
  onExitHome,
}: QuizWorkspaceProps) {
  const bank = QUIZ_BANK[segment];
  const question = bank[currentStep];
  const domainMeta = DOMAINS.find((d) => d.key === question.domain);
  const segMeta = SEGMENT_META[segment];
  const hasCurrentAnswer = answers[currentStep] !== null;
  const allAnswered = answers.every((a) => a !== null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        onSelectOption(Number(e.key) - 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        e.preventDefault();
        onPrevStep();
      } else if (e.key === 'ArrowRight' && hasCurrentAnswer) {
        e.preventDefault();
        if (currentStep < bank.length - 1) {
          onNextStep();
        } else if (allAnswered) {
          onFinishQuiz();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentStep,
    hasCurrentAnswer,
    allAnswered,
    bank.length,
    onSelectOption,
    onPrevStep,
    onNextStep,
    onFinishQuiz,
  ]);

  return (
    <section className="max-w-[820px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
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
                <span>홈으로 나가기</span>
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

        {/* 12-Step Interactive Progress Strip */}
        <div
          className="grid grid-cols-12 gap-1.5 mt-5 mb-7"
          role="navigation"
          aria-label="문항 진행 단계"
        >
          {bank.map((_, idx) => {
            const isCurrent = idx === currentStep;
            const isAnswered = answers[idx] !== null;
            const canJump = isAnswered || idx <= currentStep;
            return (
              <button
                key={idx}
                type="button"
                disabled={!canJump}
                onClick={() => canJump && onJumpStep(idx)}
                aria-label={`${idx + 1}번 문항${isAnswered ? ' (응답 완료)' : ''}`}
                className={`h-2 rounded-full transition-colors ${
                  isCurrent
                    ? 'bg-[#1F4E3D]'
                    : isAnswered
                    ? 'bg-[#1F4E3D]/45 hover:bg-[#1F4E3D]/70 cursor-pointer'
                    : 'bg-[#F2EFE7] cursor-default'
                }`}
              />
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7D776C]">
                <span className="font-semibold text-[#1F4E3D]">
                  {domainMeta?.tagLabel}
                </span>
                <span>숫자 키 1~5로도 빠르게 선택할 수 있습니다</span>
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
                    className={`w-full text-left p-4 sm:p-5 min-h-[56px] rounded-xl border transition-colors duration-150 flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4E3D] ${
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
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation Controls for Answered Steps */}
        {hasCurrentAnswer && (
          <div className="pt-6 mt-6 border-t border-[#E5DFD3] flex items-center justify-between gap-3">
            <span className="text-xs text-[#7D776C]">
              선택이 저장되었습니다
            </span>
            {currentStep < bank.length - 1 ? (
              <button
                type="button"
                onClick={onNextStep}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-lg bg-[#1F4E3D] hover:bg-[#173B2E] text-[#FAF8F3] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>다음 문항</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              allAnswered && (
                <button
                  type="button"
                  onClick={onFinishQuiz}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-lg bg-[#1F4E3D] hover:bg-[#173B2E] text-[#FAF8F3] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>진단 리포트 보기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
