import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  activeView: 'home' | 'quiz' | 'result';
  onGoHome: () => void;
  onStartQuiz: () => void;
  onNavigateSection: (sectionId: string) => void;
}

const NAV_ITEMS = [
  { id: 'hero', label: '진단 소개' },
  { id: 'indicators', label: '6대 소비 지표' },
  { id: 'types', label: '소비 유형' },
  { id: 'simulator', label: '절약 시뮬레이터' },
];

export function Header({
  activeView,
  onGoHome,
  onStartQuiz,
  onNavigateSection,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F3]/95 backdrop-blur-sm border-b border-[#E5DFD3]">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            onGoHome();
          }}
          className="font-serif text-xl font-bold tracking-tight text-[#1E1D1A] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F4E3D]"
        >
          머니체크
        </button>

        <nav
          aria-label="주요 메뉴"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534C]"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="hover:text-[#1E1D1A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              if (activeView === 'quiz') {
                onGoHome();
              } else {
                onStartQuiz();
              }
            }}
            className="px-4 py-2 min-h-[40px] rounded-lg bg-[#1F4E3D] hover:bg-[#173B2E] text-[#FAF8F3] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4E3D]"
          >
            {activeView === 'quiz' ? '홈으로 돌아가기' : '테스트 시작하기'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden w-10 h-10 rounded-lg border border-[#E5DFD3] bg-white text-[#1E1D1A] flex items-center justify-center cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="모바일 메뉴"
          className="md:hidden border-t border-[#E5DFD3] bg-[#FAF8F3] px-5 py-3 flex flex-col gap-1"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="text-left px-3 py-2.5 min-h-[44px] rounded-lg text-sm font-medium text-[#57534C] hover:text-[#1E1D1A] hover:bg-[#F2EFE7] transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
