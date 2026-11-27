interface HeaderProps {
  activeView: 'home' | 'quiz' | 'result';
  onGoHome: () => void;
  onStartQuiz: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export function Header({
  activeView,
  onGoHome,
  onStartQuiz,
  onNavigateSection,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F3]/95 backdrop-blur-sm border-b border-[#E5DFD3]">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={onGoHome}
          className="font-serif text-xl font-bold tracking-tight text-[#1E1D1A] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F4E3D]"
        >
          머니체크
        </button>

        <nav
          aria-label="주요 메뉴"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534C]"
        >
          <button
            type="button"
            onClick={() => onNavigateSection('hero')}
            className="hover:text-[#1E1D1A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            진단 소개
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('indicators')}
            className="hover:text-[#1E1D1A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            6대 소비 지표
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('types')}
            className="hover:text-[#1E1D1A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            소비 유형
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('simulator')}
            className="hover:text-[#1E1D1A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            절약 시뮬레이터
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={activeView === 'quiz' ? onGoHome : onStartQuiz}
            className="px-4 py-2.5 min-h-[40px] rounded-lg bg-[#1F4E3D] hover:bg-[#173B2E] text-[#FAF8F3] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4E3D]"
          >
            {activeView === 'quiz' ? '홈으로 돌아가기' : '테스트 시작하기'}
          </button>
        </div>
      </div>
    </header>
  );
}
