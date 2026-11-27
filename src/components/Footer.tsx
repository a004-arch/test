interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
  onStartQuiz: () => void;
}

export function Footer({ onNavigateSection, onStartQuiz }: FooterProps) {
  return (
    <footer className="border-t border-[#E5DFD3] bg-[#F2EFE7]/60 mt-20">
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2 max-w-md">
          <p className="font-serif text-lg font-bold text-[#1E1D1A]">머니체크</p>
          <p className="text-sm text-[#57534C] leading-relaxed">
            일상의 소비 습관을 6대 역량으로 진단하고, 실행 가능한 지출 개선 플랜과 복리 저축 목표를 설계하는 개인 재무 습관 연구소입니다.
          </p>
          <p className="text-xs text-[#7D776C]">
            모든 진단 응답과 시뮬레이션 기록은 사용자의 브라우저에만 저장되며 외부 서버로 전송되지 않습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#57534C]">
          <button
            type="button"
            onClick={() => onNavigateSection('indicators')}
            className="hover:text-[#1E1D1A] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            6대 소비 지표
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('types')}
            className="hover:text-[#1E1D1A] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            소비 유형 아카이브
          </button>
          <button
            type="button"
            onClick={() => onNavigateSection('simulator')}
            className="hover:text-[#1E1D1A] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            절약 시뮬레이터
          </button>
          <button
            type="button"
            onClick={onStartQuiz}
            className="text-[#1F4E3D] font-semibold hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            정밀 테스트 시작
          </button>
        </div>
      </div>
    </footer>
  );
}
