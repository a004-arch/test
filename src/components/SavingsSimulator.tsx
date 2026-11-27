import {
  SEGMENT_META,
  Segment,
  SliderValues,
  WishlistGoal,
  computeSimulatorMetrics,
} from '../data/spendingData';

interface SavingsSimulatorProps {
  segment: Segment;
  onChangeSegment?: (seg: Segment) => void;
  sliders: SliderValues;
  onChangeSliders: (next: SliderValues) => void;
  wishlist: WishlistGoal;
  onChangeWishlist: (next: WishlistGoal) => void;
  calibratedFromQuiz?: boolean;
  onNotify?: (msg: string) => void;
}

const WISH_PRESETS: WishlistGoal[] = [
  { title: '에어팟 프로', amount: 350000 },
  { title: '아이패드 에어', amount: 900000 },
  { title: '도쿄 3박4일 여행', amount: 1300000 },
  { title: '든든한 비상금 500만', amount: 5000000 },
];

export function SavingsSimulator({
  segment,
  onChangeSegment,
  sliders,
  onChangeSliders,
  wishlist,
  onChangeWishlist,
  calibratedFromQuiz = false,
  onNotify,
}: SavingsSimulatorProps) {
  const segMeta = SEGMENT_META[segment];
  const metrics = computeSimulatorMetrics(segment, sliders, wishlist);

  const updateSlider = (key: keyof SliderValues, val: number) => {
    onChangeSliders({ ...sliders, [key]: val });
  };

  const trackBg = (val: number, max: number, activeColor: string) => {
    const pct = Math.min(100, Math.max(0, (val / max) * 100));
    return `linear-gradient(to right, ${activeColor} ${pct}%, #E5DFD3 ${pct}%)`;
  };

  return (
    <div className="bg-white border border-[#E5DFD3] rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5DFD3]">
        <div>
          <p className="text-xs font-semibold text-[#1F4E3D] tracking-wide mb-1.5">
            5대 지출 다이어트 · 3년 연 4% 복리 시뮬레이터
          </p>
          <h3 className="font-serif text-2xl font-bold text-[#1E1D1A] [text-wrap:balance]">
            소소한 습관 교정이 만드는 3년 뒤 자산 차이
          </h3>
          <p className="text-sm text-[#57534C] mt-1">
            {calibratedFromQuiz
              ? '진단 응답을 바탕으로 초기 절약 권장 횟수가 반영되었습니다. 직접 슬라이더를 조절해 보세요.'
              : `${segMeta.simLabel}을 기준으로 주간·월간 지출을 줄였을 때의 누적 성과를 즉시 계산합니다.`}
          </p>
        </div>

        {onChangeSegment && (
          <div className="flex items-center gap-1 p-1 bg-[#F2EFE7] border border-[#E5DFD3] rounded-lg shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onChangeSegment('student')}
              className={`px-3 py-1.5 min-h-[36px] rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                segment === 'student'
                  ? 'bg-white text-[#1E1D1A] border border-[#E5DFD3]'
                  : 'text-[#57534C] hover:text-[#1E1D1A]'
              }`}
            >
              대학생 단가
            </button>
            <button
              type="button"
              onClick={() => onChangeSegment('worker')}
              className={`px-3 py-1.5 min-h-[36px] rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                segment === 'worker'
                  ? 'bg-white text-[#1E1D1A] border border-[#E5DFD3]'
                  : 'text-[#57534C] hover:text-[#1E1D1A]'
              }`}
            >
              직장인 단가
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-7 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FAF8F3] border border-[#E5DFD3] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1E1D1A]">위시리스트 목표 설정</span>
              <span className="text-[#7D776C]">입력 시 달성 예상 시점 자동 계산</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="wish-title-input"
                  className="block text-xs font-medium text-[#57534C] mb-1"
                >
                  목표명
                </label>
                <input
                  id="wish-title-input"
                  type="text"
                  value={wishlist.title}
                  onChange={(e) =>
                    onChangeWishlist({
                      ...wishlist,
                      title: e.target.value,
                    })
                  }
                  placeholder="예: 아이패드 에어"
                  className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg bg-white border border-[#E5DFD3] text-sm font-semibold text-[#1E1D1A] focus:outline-none focus:border-[#1F4E3D]"
                />
              </div>
              <div>
                <label
                  htmlFor="wish-amount-input"
                  className="block text-xs font-medium text-[#57534C] mb-1"
                >
                  목표 금액 (원)
                </label>
                <input
                  id="wish-amount-input"
                  type="number"
                  min={10000}
                  step={10000}
                  value={wishlist.amount}
                  onChange={(e) => {
                    const num = parseInt(e.target.value, 10);
                    onChangeWishlist({
                      ...wishlist,
                      amount: Number.isNaN(num) ? 0 : num,
                    });
                  }}
                  placeholder="예: 900000"
                  className="w-full px-3.5 py-2.5 min-h-[42px] rounded-lg bg-white border border-[#E5DFD3] font-mono tabular-nums text-sm font-semibold text-[#1E1D1A] focus:outline-none focus:border-[#1F4E3D]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {WISH_PRESETS.map((preset) => {
                const isActive =
                  wishlist.title === preset.title && wishlist.amount === preset.amount;
                return (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => {
                      onChangeWishlist(preset);
                      onNotify?.(`위시리스트 목표를 ‘${preset.title}’로 설정했습니다.`);
                    }}
                    className={`px-3 py-1.5 min-h-[34px] rounded-md text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#1F4E3D] text-[#FAF8F3] border-[#1F4E3D]'
                        : 'bg-white text-[#57534C] border-[#E5DFD3] hover:border-[#1F4E3D]/50 hover:text-[#1E1D1A]'
                    }`}
                  >
                    {preset.title} ({Math.round(preset.amount / 10000)}만 원)
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-baseline gap-2 mb-2">
                <label htmlFor="sl-cafe" className="text-sm font-semibold text-[#1E1D1A]">
                  1. 주간 카페·디저트 줄이기
                </label>
                <span className="text-xs font-mono tabular-nums text-[#1F4E3D] font-semibold shrink-0">
                  주 {sliders.cafe}회 · 회당 {segMeta.units.cafe.toLocaleString('ko-KR')}원
                </span>
              </div>
              <input
                id="sl-cafe"
                type="range"
                min={0}
                max={7}
                step={1}
                value={sliders.cafe}
                onChange={(e) => updateSlider('cafe', Number(e.target.value))}
                style={{ background: trackBg(sliders.cafe, 7, '#1F4E3D') }}
                className="ivory-slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline gap-2 mb-2">
                <label htmlFor="sl-delivery" className="text-sm font-semibold text-[#1E1D1A]">
                  2. 주간 배달·야식 줄이기
                </label>
                <span className="text-xs font-mono tabular-nums text-[#1F4E3D] font-semibold shrink-0">
                  주 {sliders.delivery}회 · 회당 {segMeta.units.delivery.toLocaleString('ko-KR')}원
                </span>
              </div>
              <input
                id="sl-delivery"
                type="range"
                min={0}
                max={6}
                step={1}
                value={sliders.delivery}
                onChange={(e) => updateSlider('delivery', Number(e.target.value))}
                style={{ background: trackBg(sliders.delivery, 6, '#1F4E3D') }}
                className="ivory-slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline gap-2 mb-2">
                <label htmlFor="sl-impulse" className="text-sm font-semibold text-[#1E1D1A]">
                  3. 월간 택시·충동쇼핑 줄이기
                </label>
                <span className="text-xs font-mono tabular-nums text-[#1F4E3D] font-semibold shrink-0">
                  월 {sliders.impulse}회 · 회당 {segMeta.units.impulse.toLocaleString('ko-KR')}원
                </span>
              </div>
              <input
                id="sl-impulse"
                type="range"
                min={0}
                max={8}
                step={1}
                value={sliders.impulse}
                onChange={(e) => updateSlider('impulse', Number(e.target.value))}
                style={{ background: trackBg(sliders.impulse, 8, '#1F4E3D') }}
                className="ivory-slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline gap-2 mb-2">
                <label htmlFor="sl-fixed" className="text-sm font-semibold text-[#1E1D1A]">
                  4. OTT·멤버십·통신비 다이어트
                </label>
                <span className="text-xs font-mono tabular-nums text-[#B5781D] font-semibold shrink-0">
                  월 {sliders.fixed}만 원 절감
                </span>
              </div>
              <input
                id="sl-fixed"
                type="range"
                min={0}
                max={12}
                step={1}
                value={sliders.fixed}
                onChange={(e) => updateSlider('fixed', Number(e.target.value))}
                style={{ background: trackBg(sliders.fixed, 12, '#B5781D') }}
                className="ivory-slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline gap-2 mb-2">
                <label htmlFor="sl-micro" className="text-sm font-semibold text-[#1E1D1A]">
                  5. 주간 편의점·간식·소액결제 줄이기
                </label>
                <span className="text-xs font-mono tabular-nums text-[#B5781D] font-semibold shrink-0">
                  주 {sliders.micro}회 · 회당 {segMeta.units.micro.toLocaleString('ko-KR')}원
                </span>
              </div>
              <input
                id="sl-micro"
                type="range"
                min={0}
                max={7}
                step={1}
                value={sliders.micro}
                onChange={(e) => updateSlider('micro', Number(e.target.value))}
                style={{ background: trackBg(sliders.micro, 7, '#B5781D') }}
                className="ivory-slider"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#1E1D1A] text-[#FAF8F3] rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 pb-5 border-b border-white/15">
            <div>
              <p className="text-xs text-[#CFC7B7] mb-1">월간 예상 절약액</p>
              <p className="font-mono tabular-nums text-xl font-semibold text-[#8CE0B8]">
                +{metrics.monthlyTotal.toLocaleString('ko-KR')}원
              </p>
            </div>
            <div>
              <p className="text-xs text-[#CFC7B7] mb-1">1년(12개월) 예상 절약액</p>
              <p className="font-mono tabular-nums text-xl font-semibold text-[#FAF8F3]">
                {metrics.yearlyTotal.toLocaleString('ko-KR')}원
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-[#CFC7B7] mb-2">
              <span>3년 적립 시 예상 모금액</span>
              <span>연 4% 월복리 · 세전 기준</span>
            </div>
            <p className="font-mono tabular-nums text-3xl sm:text-4xl font-bold text-[#E7C888] tracking-tight">
              {metrics.compound3Yr.toLocaleString('ko-KR')}원
            </p>
          </div>

          <div className="bg-white/8 border border-white/10 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#FAF8F3] truncate">
                목표: {wishlist.title || '나의 위시리스트'} (
                {metrics.safePrice.toLocaleString('ko-KR')}원)
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#8CE0B8] shrink-0">
                1년 기준 {metrics.yearPercent}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8CE0B8] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, metrics.yearPercent)}%` }}
              />
            </div>

            <p className="text-xs text-[#E5DFD3] leading-relaxed">
              {metrics.monthsNeeded === null ? (
                '슬라이더를 조절해 월간 절약 플랜을 구성해 보세요.'
              ) : metrics.monthsNeeded <= 1 ? (
                <>
                  이대로 실천하면 <strong className="text-[#8CE0B8]">1개월 이내</strong>에 목표 금액을 모을 수 있습니다.
                </>
              ) : (
                <>
                  매달{' '}
                  <span className="font-mono tabular-nums">
                    {metrics.monthlyTotal.toLocaleString('ko-KR')}원
                  </span>
                  을 모으면 <strong className="text-[#8CE0B8]">약 {metrics.monthsNeeded}개월 뒤</strong> 목표 달성이 가능합니다.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
