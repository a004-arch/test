export type Segment = 'student' | 'worker';

export type DomainKey = 'plan' | 'impulse' | 'micro' | 'fixed' | 'value' | 'saving';

export interface DomainMeta {
  key: DomainKey;
  index: string;
  short: string;
  tagLabel: string;
  summary: string;
  leakTitle: string;
}

export interface QuizOption {
  score: number;
  text: string;
}

export interface QuizQuestion {
  domain: DomainKey;
  topic: string;
  q: string;
  options: QuizOption[];
}

export interface PrecisionType {
  id: 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';
  index: string;
  shortName: string;
  subPhrase: string;
  title: string;
  categoryLabel: string;
  shareRatio: string;
  desc: string;
  keyHabit: string;
  prescription: string;
  bestMatch: {
    name: string;
    desc: string;
  };
  worstMatch: {
    name: string;
    desc: string;
  };
}

export interface SolutionGuide {
  key: DomainKey;
  tag: string;
  title: string;
  desc: string;
  steps: string[];
}

export interface SliderValues {
  cafe: number;
  delivery: number;
  impulse: number;
  fixed: number;
  micro: number;
}

export interface WishlistGoal {
  title: string;
  amount: number;
}

export interface ItemRecord {
  qIndex: number;
  domain: DomainKey;
  topic: string;
  question: string;
  selectedIndex: number;
  selectedText: string;
  score: number;
}

export interface WeakDomainReport extends DomainMeta {
  score: number;
  relatedItems: ItemRecord[];
}

export interface AnalysisResult {
  totalScore: number;
  topPercentile: number;
  domainScores: Record<DomainKey, number>;
  primaryTypeKey: PrecisionType['id'];
  subTendencyText: string;
  weakTop2: [WeakDomainReport, WeakDomainReport];
  itemRecords: ItemRecord[];
}

export interface AppState {
  segment: Segment;
  completed: boolean;
  answers: (number | null)[];
  missionsChecked: boolean[];
  sliders: SliderValues;
  wishlist: WishlistGoal;
}

export const STORAGE_KEY = 'moneycheck_ivory_v1_state';

export const DOMAINS: DomainMeta[] = [
  {
    key: 'plan',
    index: '01',
    short: '예산 계획력',
    tagLabel: '영역 1/6 · 예산 및 계획성',
    summary: '수입 발생 시 항목별 예산을 배분하고 지출 흐름을 주기적으로 점검하는 역량',
    leakTitle: '무계획 예산 운영 및 지출 흐름 방치',
  },
  {
    key: 'impulse',
    index: '02',
    short: '충동 통제력',
    tagLabel: '영역 2/6 · 충동 및 감정소비 통제',
    summary: '스트레스·우울감·SNS 유행에 흔들리지 않고 결제 전 숙려 시간을 갖는 역량',
    leakTitle: '스트레스·감정 기복에 따른 도파민 충동결제',
  },
  {
    key: 'micro',
    index: '03',
    short: '소액지출 방어력',
    tagLabel: '영역 3/6 · 소액·반복 지출 관리',
    summary: '카페·배달·편의점·택시처럼 작아 보이지만 빈도가 높은 일상 누수를 관리하는 역량',
    leakTitle: '카페·배달·편의점 등 습관성 소액 반복 누수',
  },
  {
    key: 'fixed',
    index: '04',
    short: '고정비 관리력',
    tagLabel: '영역 4/6 · 고정비·구독 최적화',
    summary: '정기구독·통신요금·무이자 할부 등 매월 자동 유출되는 고정 청구액을 최적화하는 역량',
    leakTitle: '미사용 정기구독·통신비·할부 고정비 방치',
  },
  {
    key: 'value',
    index: '05',
    short: '가성비 분별력',
    tagLabel: '영역 5/6 · 할인·가성비 분별력',
    summary: '마감 세일·1+1·무료배송 조건에 휘둘리지 않고 실제 효용 가치로 판단하는 역량',
    leakTitle: '세일·무료배송·1+1 행사에 흔들리는 착시 소비',
  },
  {
    key: 'saving',
    index: '06',
    short: '저축 시스템',
    tagLabel: '영역 6/6 · 저축·비상금 시스템',
    summary: '선저축 자동이체 비율과 돌발 지출에 대비한 별도 비상금 방어선 구축 수준',
    leakTitle: '선저축 자동화 및 비상금 방어선 부재',
  },
];

export const SEGMENT_META: Record<
  Segment,
  {
    name: string;
    short: string;
    badge: string;
    simLabel: string;
    description: string;
    units: { cafe: number; delivery: number; impulse: number; micro: number };
  }
> = {
  student: {
    name: '대학생 / 취준생',
    short: '대학생·취준생',
    badge: '대학생 / 취준생 기준',
    simLabel: '대학생 평균 단가 적용',
    description: '용돈·알바비 관리, 캠퍼스 카페·편의점·배달 중심 12문항',
    units: { cafe: 4800, delivery: 19000, impulse: 25000, micro: 5500 },
  },
  worker: {
    name: '직장인 / 프리랜서',
    short: '직장인·프리랜서',
    badge: '직장인 / 프리랜서 기준',
    simLabel: '직장인 평균 단가 적용',
    description: '월급·고정비·할부 관리, 점심·커피·택시·쇼핑 중심 12문항',
    units: { cafe: 6000, delivery: 26000, impulse: 45000, micro: 7500 },
  },
};

export const QUIZ_BANK: Record<Segment, QuizQuestion[]> = {
  student: [
    {
      domain: 'plan',
      topic: '월간 용돈·알바비 예산 수립',
      q: '매달 용돈이나 아르바이트 급여가 들어왔을 때 한 달 예산 계획은 어떻게 세우나요?',
      options: [
        { score: 100, text: '식비·교통·여가·비상금 항목별로 주간 가용 금액까지 1만 원 단위로 쪼개어 관리한다' },
        { score: 75, text: '저축할 돈을 먼저 빼두고, 남은 생활비 총액 한도 안에서 대략적인 계획만 세워 쓴다' },
        { score: 50, text: '머릿속으로만 “이번 달엔 아껴야지” 다짐할 뿐 별도의 예산 배분 없이 사용한다' },
        { score: 25, text: '입금 직후 사고 싶던 것부터 결제하고, 월말 잔액이 2~3만 원 남으면 그때부터 버틴다' },
        { score: 0, text: '통장 잔고를 거의 확인하지 않으며 부족하면 후불결제·소액신용·추가 용돈에 의존한다' },
      ],
    },
    {
      domain: 'plan',
      topic: '가계부 및 결제 내역 복기 습관',
      q: '평소 내가 어디에 얼마를 썼는지 가계부 앱이나 카드 내역으로 점검하는 주기는?',
      options: [
        { score: 100, text: '가계부 앱 연동으로 매일 또는 주 1회 이상 카테고리별 지출 추이를 꼼꼼히 점검한다' },
        { score: 75, text: '주 1~2회 입출금 알림과 잔액을 확인하며 예산 초과 여부를 체크한다' },
        { score: 50, text: '한 달에 한 번, 카드 명세서나 월말 정산 알림이 올 때만 총액을 훑어본다' },
        { score: 25, text: '잔액 부족 알림이 뜰 때만 당황해서 최근 결제 내역을 뒤늦게 찾아본다' },
        { score: 0, text: '내역을 보면 스트레스받아서 아예 안 보거나 총지출이 얼마인지 전혀 모른다' },
      ],
    },
    {
      domain: 'impulse',
      topic: '시험·과제 스트레스성 감정 소비',
      q: '시험 기간, 취업 준비, 인간관계로 스트레스가 폭발한 날 나의 지갑 반응은?',
      options: [
        { score: 100, text: '산책·운동·수면 등 비용이 들지 않는 방법으로 기분을 전환하며 소비와 감정을 분리한다' },
        { score: 75, text: '미리 정해둔 소액 보상 한도(5천~1만 원 이내 디저트 등) 안에서만 기분을 낸다' },
        { score: 50, text: '월 1~2회 정도 기분 전환 겸 2~4만 원대 맛있는 음식이나 귀여운 소품을 즉흥 구매한다' },
        { score: 25, text: '“오늘 같은 날은 써도 돼!”라며 계획에 없던 옷·화장품·굿즈에 5~10만 원 이상 결제한다' },
        { score: 0, text: '새벽 감성이나 우울감이 올 때마다 쇼핑 앱을 켜서 장바구니 물건을 연달아 질러버린다' },
      ],
    },
    {
      domain: 'impulse',
      topic: 'SNS 유행 아이템 & 장바구니 숙려 기간',
      q: '인스타그램·유튜브에서 취향 저격 패션템이나 핫플 굿즈를 발견했을 때 결제까지 걸리는 시간은?',
      options: [
        { score: 100, text: '위시리스트에 적어두고 최소 3~7일 이상 고민하며 대체품이 집에 있는지 먼저 확인한다' },
        { score: 75, text: '장바구니에 담아두고 최소 하루(24시간) 자고 일어난 뒤에도 생각나면 구매한다' },
        { score: 50, text: '리뷰 몇 개만 빠르게 훑어보고 당일 저녁 안에 결제하는 편이다' },
        { score: 25, text: '품절 임박이나 인플루언서 공구 문구를 보면 10분 이내에 바로 간편결제를 누른다' },
        { score: 0, text: '보이자마자 홀린 듯 결제하고, 택배가 도착할 때쯤 내가 뭘 샀는지 기억나지 않을 때도 있다' },
      ],
    },
    {
      domain: 'micro',
      topic: '캠퍼스·카공 카페 및 편의점 간식 빈도',
      q: '일주일 기준 유료 카페 음료·디저트 및 편의점 간식에 지출하는 실제 빈도는?',
      options: [
        { score: 100, text: '텀블러·집 커피를 애용하며 유료 카페·편의점 간식은 주 1회 이하(주 5천 원 미만)로 쓴다' },
        { score: 75, text: '저가 커피 브랜드 위주로 주 2~3회 정도(주 1만 원 내외)만 계획적으로 소비한다' },
        { score: 50, text: '공강이나 모임 때마다 자연스럽게 주 4~5회(주 2만~2.5만 원 수준) 카페·편의점에 간다' },
        { score: 25, text: '하루 1잔 이상 프랜차이즈 음료 + 간식이 필수라 주 6~7회(주 3.5만 원 이상) 지출한다' },
        { score: 0, text: '하루 두 번 이상 카페·디저트·편의점 신상을 사 먹으며 한 달 20만 원 이상이 나간다' },
      ],
    },
    {
      domain: 'micro',
      topic: '배달 앱 야식 및 택시 이용 습관',
      q: '자취방·집에서 배달 음식을 시키거나 지각·귀찮음으로 택시를 타는 빈도는?',
      options: [
        { score: 100, text: '학식·집밥 위주로 해결하고 대중교통을 이용해 배달·택시는 월 1회 이하로 극히 드물다' },
        { score: 75, text: '정말 피곤한 날이나 친구들과 모일 때만 월 2~3회 정도 포장·배달을 이용한다' },
        { score: 50, text: '주 1~2회 정도 배달을 시키거나 늦잠 자는 날 종종 택시를 탄다 (월 8~12만 원 수준)' },
        { score: 25, text: '주 3~4회 배달 앱을 켜며 최소주문금액을 맞추려고 사이드 메뉴까지 항상 추가한다' },
        { score: 0, text: '거의 매일 배달로 끼니를 해결하고 짧은 거리도 습관적으로 택시를 타 지출이 가장 크다' },
      ],
    },
    {
      domain: 'fixed',
      topic: 'OTT·음원·멤버십 정기구독 관리',
      q: '현재 매달 자동결제 중인 OTT, 음악, 쇼핑 멤버십, 앱 구독 서비스 관리 상태는?',
      options: [
        { score: 100, text: '꼭 쓰는 1개 이하만 학생 할인·파티 공유로 유지하며 매월 정기결제 목록을 점검한다' },
        { score: 75, text: '실제 자주 쓰는 2개 내외만 구독 중이고 안 보는 달에는 즉시 일시정지·해지한다' },
        { score: 50, text: '3~4개 정도 구독 중인데 한 달에 한두 번만 켜는 서비스도 귀찮아서 그냥 두고 있다' },
        { score: 25, text: '무료 체험 해지일을 놓쳐 결제된 앱이 종종 있고 매달 구독료로 3~5만 원 이상 나간다' },
        { score: 0, text: '어떤 앱에서 얼마가 빠져나가는지 정확히 모른 채 수개월째 자동결제를 방치하고 있다' },
      ],
    },
    {
      domain: 'fixed',
      topic: '통신 요금제 및 후불결제·할부 관리',
      q: '스마트폰 통신 요금제와 소액결제·후불결제(BNPL)·할부 사용 패턴은 어떤가요?',
      options: [
        { score: 100, text: '1~2만 원대 알뜰폰/결합 요금제를 쓰며 후불결제·할부는 일절 사용하지 않는다' },
        { score: 75, text: '데이터 사용량에 맞는 적정 요금제를 쓰고 불가피한 고가 교재·장비 외엔 일시불만 쓴다' },
        { score: 50, text: '통신사 기본 요금제(5~6만 원대)를 그대로 쓰며 가끔 휴대폰 소액결제를 이용한다' },
        { score: 25, text: '데이터가 남는데도 고가 요금제를 방치 중이고 후불결제 한도를 자주 끌어다 쓴다' },
        { score: 0, text: '고액 통신비 + 휴대폰 소액결제 + 후불결제가 겹쳐 매달 고정 청구서가 감당하기 벅차다' },
      ],
    },
    {
      domain: 'value',
      topic: '마감 세일·무료배송 기준 채우기 반응',
      q: '쇼핑몰 타임세일이나 “8,000원만 더 담으면 무료배송!” 문구를 마주했을 때 행동은?',
      options: [
        { score: 100, text: '배송비 3,000원을 내더라도 불필요한 물건은 절대 추가하지 않으며 계획된 생필품만 산다' },
        { score: 75, text: '평소 꼭 쓰는 소모품(휴지·칫솔 등)이 있을 때만 묶음으로 채우고 없으면 배송비를 낸다' },
        { score: 50, text: '배송비가 아까워서 당장 안 급한 양말·간식·문구류를 장바구니에 끼워 넣곤 한다' },
        { score: 25, text: '50% 이상 세일이나 1+1 표시를 보면 원래 살 생각이 없던 품목도 “이득이다”라며 산다' },
        { score: 0, text: '할인 쿠폰 소멸 알림만 떠도 아까워서 억지로 쇼핑거리를 찾아 결제하는 편이다' },
      ],
    },
    {
      domain: 'value',
      topic: '단위 가격 비교 및 중고·학생 혜택 활용',
      q: '전공 서적, 전자기기, 생활용품을 구매할 때 가격 비교와 혜택 활용 수준은?',
      options: [
        { score: 100, text: '최저가·단위가격 비교는 기본이고 학생 복지몰·중고거래·도서관을 적극 활용해 아낀다' },
        { score: 75, text: '구매 전 주요 쇼핑몰 2~3곳의 가격과 쿠폰을 비교해 합리적인 가격에 구매한다' },
        { score: 50, text: '자주 쓰는 쇼핑 앱 한 곳에서만 대충 보고 바로 주문하는 편이다' },
        { score: 25, text: '귀찮아서 가격 비교 없이 눈에 보이는 첫 번째 링크나 오프라인 정가로 바로 산다' },
        { score: 0, text: '비싸더라도 예쁜 패키지나 빠른 배송·브랜드 감성이면 가격을 따지지 않고 결제한다' },
      ],
    },
    {
      domain: 'saving',
      topic: '선저축 비율 및 자동이체 시스템',
      q: '한 달 총수입(용돈+알바비+장학금 등) 중 순수 저축·청약·적금으로 모으는 비율은?',
      options: [
        { score: 100, text: '수입 입금일 당일 40% 이상이 적금·청약·파킹통장으로 자동이체되도록 세팅해 두었다' },
        { score: 75, text: '매달 25~39% 수준을 꾸준히 먼저 떼어 저축 계좌로 옮겨 놓는다' },
        { score: 50, text: '생활비를 먼저 다 쓰고 월말에 돈이 남으면 10~20% 정도를 비정기적으로 저축한다' },
        { score: 25, text: '적금은 들어두었지만 생활비가 모자라 만기 전에 중도해지하거나 자주 빼서 쓴다' },
        { score: 0, text: '현재 저축 비율 0~5% 미만으로, 매달 들어온 돈을 남김없이 다 쓰기에 급급하다' },
      ],
    },
    {
      domain: 'saving',
      topic: '비상금(예비자금) 계좌 분리 운영',
      q: '갑작스러운 병원비, 경조사, 노트북 수리 등에 대비한 별도의 비상금 통장이 있나요?',
      options: [
        { score: 100, text: '최소 50~100만 원 이상의 비상금을 입출금 카드와 분리된 고금리 파킹통장에 보유 중이다' },
        { score: 75, text: '소액이지만 별도 세이프박스·비상금 칸에 20~50만 원 정도 예비자금을 모아두었다' },
        { score: 50, text: '따로 분리된 비상금 통장은 없고 그냥 주거래 생활비 통장에 섞여 있다' },
        { score: 25, text: '예비자금이 거의 없어 돌발 지출이 생기면 부모님께 손을 벌리거나 다음 달 돈을 당겨 쓴다' },
        { score: 0, text: '비상금은커녕 매달 말일마다 잔고 0원에 가까워 돌발 상황에 완전히 무방비 상태다' },
      ],
    },
  ],
  worker: [
    {
      domain: 'plan',
      topic: '월급날 통장 쪼개기 및 예산 배분',
      q: '매달 급여(또는 프리랜서 정산금)가 입금된 직후 나의 자금 배분 프로세스는?',
      options: [
        { score: 100, text: '급여일 당일 저축·투자·고정비·변동생활비 4개 통장으로 자동 분배되어 예산이 완벽히 고정된다' },
        { score: 75, text: '저축과 고정비를 먼저 뺀 뒤 한 달 생활비 목표 한도를 정해두고 체크·신용카드를 쓴다' },
        { score: 50, text: '따로 통장을 쪼개진 않고 급여 통장 하나에서 카드값과 생활비가 모두 빠져나가게 둔다' },
        { score: 25, text: '카드 결제일에 대금 빠져나가고 나면 남는 돈이 적어 다시 신용카드로 한 달을 버틴다' },
        { score: 0, text: '월급이 스쳐 지나가며 매달 고정 지출과 변동 지출이 각각 얼마인지 파악조차 안 된다' },
      ],
    },
    {
      domain: 'plan',
      topic: '자산·지출 트래킹 및 카드 명세서 점검',
      q: '마이데이터·가계부 앱 등을 통해 월간 지출 내역과 순자산 흐름을 점검하는 빈도는?',
      options: [
        { score: 100, text: '매주 지출 리포트를 확인하고 매월 말 예산 대비 초과 항목을 분석해 다음 달 한도에 반영한다' },
        { score: 75, text: '주 1회 이상 카드 누적 사용액을 확인하며 월 목표 금액을 넘지 않도록 속도 조절을 한다' },
        { score: 50, text: '카드 결제일 며칠 전에 빠져나갈 총액 알림만 확인하고 세부 내역은 잘 보지 않는다' },
        { score: 25, text: '결제 예정 금액이 예상보다 너무 크게 찍혔을 때만 놀라서 명세서를 열어본다' },
        { score: 0, text: '여러 카드사와 계좌에 결제가 흩어져 있어 이번 달 총소비액을 전혀 모른 채 지낸다' },
      ],
    },
    {
      domain: 'impulse',
      topic: '야근·업무 스트레스 보상 소비',
      q: '야근이나 격무에 시달린 퇴근길, 나를 위로하기 위한 이른바 ‘보상 소비’ 패턴은?',
      options: [
        { score: 100, text: '운동·반신욕·취미 등 건강한 루틴으로 풀며 스트레스 때문에 충동 결제하는 일은 거의 없다' },
        { score: 75, text: '월간 리프레시 예산 한도 내에서만 소소한 맛있는 식사 정도로 기분 전환을 한다' },
        { score: 50, text: '주 1회 정도 퇴근길 택시 탑승이나 치맥·쇼핑 등으로 3~5만 원대 기분파 소비를 한다' },
        { score: 25, text: '“내가 돈 벌어서 뭐 해!”라며 계획 없던 백화점·패션·가젯·호캉스에 10~30만 원을 쓴다' },
        { score: 0, text: '스트레스받을 때마다 고가 명품·취미 장비·심야 쇼핑을 지르며 사후에 카드값을 후회한다' },
      ],
    },
    {
      domain: 'impulse',
      topic: '고가 위시템 구매 전 숙려 원칙',
      q: '10만 원 이상의 의류, 전자기기, 취미용품이 사고 싶어졌을 때 나의 결정 방식은?',
      options: [
        { score: 100, text: '최소 1주일 이상 숙려 기간을 거치고 기존 보유 물품과 예산 여유를 따진 뒤 일시불로만 산다' },
        { score: 75, text: '장바구니에 최소 2~3일 담아두고 비교 검토한 뒤 정말 필요할 때만 결제한다' },
        { score: 50, text: '후기와 유튜브 리뷰를 당일에 찾아보고 마음이 기울면 바로 구매 버튼을 누른다' },
        { score: 25, text: '인플루언서 추천이나 한정 수량 문구를 보면 고민 없이 즉시 간편결제로 지른다' },
        { score: 0, text: '당장 현금이 부족해도 무이자 할부 개월 수만 보고 30~100만 원대 물건을 충동 구매한다' },
      ],
    },
    {
      domain: 'micro',
      topic: '출근길·점심 직후 커피·디저트·편의점 지출',
      q: '평일 출근길, 점심 식후 카페 음료·디저트 및 편의점 간식에 쓰는 주간 지출 패턴은?',
      options: [
        { score: 100, text: '사내 탕비실·텀블러를 적극 활용해 외부 유료 카페·간식 지출은 주 1회 이하로 방어한다' },
        { score: 75, text: '테이크아웃 저가 커피 위주로 주 2~3회(주 1만 원 내외)만 가볍게 소비한다' },
        { score: 50, text: '동료들과 매일 식후 커피를 마셔 주 5회(주 2.5만~3만 원 수준) 고정적으로 나간다' },
        { score: 25, text: '모닝커피 + 식후 프랜차이즈 음료·디저트 + 오후 간식까지 하루 1만 원 이상 매일 쓴다' },
        { score: 0, text: '스페셜티 카페·베이커리·편의점 들르기가 습관이라 다과비로만 월 25만 원 이상 쓴다' },
      ],
    },
    {
      domain: 'micro',
      topic: '퇴근 후 배달·외식 및 출퇴근 택시비',
      q: '평일 저녁·주말 배달 앱 주문과 늦잠·회식 후 택시 이용으로 나가는 빈도는?',
      options: [
        { score: 100, text: '밀프렙·집밥과 대중교통을 철저히 지켜 배달·택시는 월 1~2회 이하로 통제한다' },
        { score: 75, text: '주말 외식이나 불가피한 야근 시에만 제한적으로 이용해 월 10만 원 이내로 관리한다' },
        { score: 50, text: '주 2회 정도 배달을 시키고 한 달에 3~4번 택시를 타 월 15~25만 원 정도 지출한다' },
        { score: 25, text: '퇴근 후 요리할 기력이 없어 주 3~4회 이상 배달·간편외식을 하고 택시도 자주 탄다' },
        { score: 0, text: '거의 매일 배달·외식·택시를 이용하며 식비·교통비 변동지출이 월 60만 원을 훌쩍 넘는다' },
      ],
    },
    {
      domain: 'fixed',
      topic: 'OTT·멤버십·정기구독 및 통신·보험 고정비',
      q: '통신비, 보험료, 각종 OTT·쇼핑 멤버십·클라우드 등 매월 숨만 쉬어도 나가는 고정비 상태는?',
      options: [
        { score: 100, text: '알뜰폰·다이렉트 보험으로 다이어트를 마쳤고 구독도 꼭 쓰는 1~2개만 철저히 유지한다' },
        { score: 75, text: '분기마다 정기결제 내역을 점검해 안 쓰는 구독을 해지하며 적정 고정비를 유지 중이다' },
        { score: 50, text: '약정 끝난 6~8만 원대 통신요금제나 잘 안 보는 OTT 2~3개를 귀찮아서 그대로 두고 있다' },
        { score: 25, text: '쇼핑·배달 멤버십만 4개 이상이고 중복 보장 보험·통신비 등으로 매달 큰돈이 고정 유출된다' },
        { score: 0, text: '자동이체 항목이 너무 많아 총액 파악도 안 되며 미사용 유료 구독이 수개월째 방치되어 있다' },
      ],
    },
    {
      domain: 'fixed',
      topic: '신용카드 할부 잔액 및 고정 결제 구조',
      q: '현재 신용카드 할부(무이자 포함) 이용 습관과 매월 카드 고정 결제 부담 수준은?',
      options: [
        { score: 100, text: '체크카드 또는 신용카드 일시불만 사용하며 할부 잔액 0원 원칙을 철저히 지킨다' },
        { score: 75, text: '연 1~2회 꼭 필요한 대형 지출 외에는 할부를 쓰지 않아 다음 달 이월 부담이 거의 없다' },
        { score: 50, text: '2~3개월 무이자 할부가 항상 1~2건씩 걸려 있어 매달 기본 카드값이 깔려 있는 편이다' },
        { score: 25, text: '여러 건의 할부가 중첩되어 월급날마다 전월 할부금으로만 수십만 원이 먼저 빠져나간다' },
        { score: 0, text: '할부 누적으로 일시불 여력이 막혀 또 할부를 긁거나 리볼빙·현금서비스 유혹을 느낀다' },
      ],
    },
    {
      domain: 'value',
      topic: '카드 실적·프로모션·무료배송 함정 대응',
      q: '카드사 청구할인 실적 채우기나 온라인몰 특가·무료배송 조건 앞에서의 행동 패턴은?',
      options: [
        { score: 100, text: '실적이나 무료배송을 채우기 위한 억지 소비는 절대 안 하며 순수 피킹률만 냉정히 계산한다' },
        { score: 75, text: '원래 구매 예정이던 생필품 목록이 있을 때만 특가·묶음배송 혜택을 활용한다' },
        { score: 50, text: '전월 실적 구간이나 무료배송 금액이 조금 모자라면 당장 안 급한 물건을 더 담곤 한다' },
        { score: 25, text: '라이브커머스 특가나 대용량 묶음 할인을 보면 “싸게 샀다”며 필요 이상으로 쟁여두고 버린다' },
        { score: 0, text: '할인 쿠폰·멤버십 적립 혜택을 받으려고 오히려 평소보다 훨씬 많은 금액을 결제한다' },
      ],
    },
    {
      domain: 'value',
      topic: '가심비 vs 실질 효용 가치 판단',
      q: '물건이나 서비스를 구매할 때 브랜드 감성·편의성 대비 실질 사용 빈도(가성비)를 따지나요?',
      options: [
        { score: 100, text: '1회 사용당 비용과 대체 가능성을 꼼꼼히 따져 후회 없는 소비만 한다' },
        { score: 75, text: '주요 쇼핑몰 최저가와 실사용 후기를 비교해 가격 대비 만족도가 검증된 제품을 고른다' },
        { score: 50, text: '평소엔 비교하지만 피곤하거나 바쁠 땐 가격을 안 따지고 로켓·새벽배송으로 바로 시킨다' },
        { score: 25, text: '기능이 비슷해도 예쁜 디자인·유명 브랜드 프리미엄에 흔쾌히 웃돈을 지불하는 편이다' },
        { score: 0, text: '비싸게 주고 산 뒤 한두 번 쓰고 방치된 운동기구·옷·주방용품이 집안에 가득하다' },
      ],
    },
    {
      domain: 'saving',
      topic: '월 실수령액 대비 선저축·투자 비율',
      q: '세후 월 평균 수입 중 순수 저축·투자(적금, 연금저축/IRP, ETF 등)로 적립하는 비율은?',
      options: [
        { score: 100, text: '실수령액의 50% 이상을 급여일 자동이체로 저축·투자 계좌에 흔들림 없이 적립한다' },
        { score: 75, text: '실수령액의 35~49% 수준을 목표 시드머니 계획에 맞춰 매달 꾸준히 모으고 있다' },
        { score: 50, text: '실수령액의 20~34% 정도 저축하지만 경조사나 여행이 있는 달엔 저축액이 크게 줄어든다' },
        { score: 25, text: '실수령액의 10~19% 미만으로, 남는 돈을 모으려다 보니 매달 저축액이 들쭉날쭉하다' },
        { score: 0, text: '저축률 10% 미만(또는 0%)으로 소득 증가 속도보다 소비 증가 속도가 빨라 돈이 안 모인다' },
      ],
    },
    {
      domain: 'saving',
      topic: '생활비 3개월 치 비상금 방어 시스템',
      q: '이직 공백기, 건강 문제, 급전 필요 상황에 대비한 유동성 비상금(파킹통장·CMA) 준비 수준은?',
      options: [
        { score: 100, text: '최소 3~6개월 치 필수 생활비 이상의 비상금이 별도 파킹통장·CMA에 안전하게 분리되어 있다' },
        { score: 75, text: '1~2개월 치 생활비 수준의 비상금을 별도 계좌에 모아두었고 조금씩 늘려가는 중이다' },
        { score: 50, text: '비상금 전용 통장은 따로 없지만 급할 때 깰 수 있는 소액 예·적금 정도만 있다' },
        { score: 25, text: '돌발 지출이 발생하면 정기적금을 깨거나 신용카드 할부·마이너스통장으로 메꾼다' },
        { score: 0, text: '여유 현금이 전혀 없어 한 달만 소득이 끊기거나 큰 지출이 생겨도 즉시 자금 경색이 온다' },
      ],
    },
  ],
};

export const PRECISION_TYPES: Record<PrecisionType['id'], PrecisionType> = {
  T1: {
    id: 'T1',
    index: '01',
    shortName: '욜로 플렉서',
    subPhrase: '도파민·감정 보상 기질이 더해진',
    title: '도파민 추구형 욜로 플렉서',
    categoryLabel: '감정·충동 지출 중심',
    shareRatio: '전체 진단 참여자 중 약 16%',
    desc: '현재의 기분 전환과 자기 보상, 강렬한 경험 가치를 우선시하는 유형입니다. 평소에는 괜찮다가도 스트레스나 SNS 유혹이 찾아오면 예산 브레이크가 풀리며 굵직한 결제로 이어지기 쉽습니다. 의지력 대신 결제 지연 장치(장바구니 숙려제·선저축 분리)만 걸어두면 자산이 가장 빠르게 반등합니다.',
    keyHabit: '스트레스 해소용 즉흥 결제 · SNS 발견 후 빠른 구매 결정',
    prescription: '48시간 장바구니 숙려제 및 원클릭 결제 해제',
    bestMatch: {
      name: '빈틈없는 시스템 짠테크 마스터',
      desc: '감정적 과소비 순간에 냉철한 브레이크를 걸어주고 자산 배분 루틴을 만들어주는 파트너',
    },
    worstMatch: {
      name: '도파민 추구형 욜로 플렉서',
      desc: '서로의 기분 전환 플렉스를 응원하다가 함께 카드 명세서 부담을 키우기 쉬운 조합',
    },
  },
  T2: {
    id: 'T2',
    index: '02',
    shortName: '소확행 수집가',
    subPhrase: '습관성 소액 지출 기질이 섞인',
    title: '가랑비에 옷 젖는 소확행 수집가',
    categoryLabel: '배달·카페·소액 반복 중심',
    shareRatio: '전체 진단 참여자 중 약 27%',
    desc: '큰 사치는 잘 부리지 않지만, 매일 반복되는 커피·디저트·배달팁·편의점·택시비 등 5천~2만 원대 소액 결제에서 지갑 구멍이 열려 있는 유형입니다. 건당 금액이 작아 부담이 적지만 1년 누적 유출액은 수백만 원에 달합니다. 주간 변동비 전용 체크카드 한도 설정이 효과적입니다.',
    keyHabit: '매일 습관적 카페·편의점 방문 · 주 3회 이상 배달/택시 이용',
    prescription: '소액 지출 전용 체크카드 주간 총량제 운영',
    bestMatch: {
      name: '밸런스 잡힌 스마트 실속파',
      desc: '일상의 즐거움은 유지하면서도 불필요한 배달·카페 빈도를 자연스럽게 줄여주는 메이트',
    },
    worstMatch: {
      name: '가랑비에 옷 젖는 소확행 수집가',
      desc: '만날 때마다 디저트 2차와 택시 이동을 당연하게 여겨 소액 누수가 배가 되는 조합',
    },
  },
  T3: {
    id: 'T3',
    index: '03',
    shortName: '고정비 누수형',
    subPhrase: '정기구독·할부 방치 성향이 섞인',
    title: '숨만 쉬어도 빠져나가는 고정비 누수형',
    categoryLabel: '구독·통신·할부 방치 중심',
    shareRatio: '전체 진단 참여자 중 약 18%',
    desc: '일상에서 돈을 헤프게 쓰는 것 같지 않은데도 통장에 돈이 안 모인다면 원인은 자동이체와 할부입니다. 잘 안 보는 OTT·멤버십, 비싼 통신 요금제, 무이자 할부 잔액이 매달 가용 소득을 먼저 잠식하고 있습니다. 하루 날을 잡아 고정비 구조조정만 실행해도 매달 현금흐름이 개선됩니다.',
    keyHabit: '미사용 정기구독 방치 · 고액 통신요금제 및 무이자 할부 누적',
    prescription: '정기결제 일괄 해지 및 알뜰폰·일시불 원칙 전환',
    bestMatch: {
      name: '빈틈없는 시스템 짠테크 마스터',
      desc: '숨어 있는 자동결제와 고비용 요금제를 단숨에 정리해 고정비를 줄여주는 조력자',
    },
    worstMatch: {
      name: '할인에 약한 가성비 착시 쇼퍼',
      desc: '멤버십 혜택과 무이자 할부 프로모션에 함께 설득당해 고정 청구액을 키우기 쉬운 조합',
    },
  },
  T4: {
    id: 'T4',
    index: '04',
    shortName: '가성비 착시 쇼퍼',
    subPhrase: '세일·프로모션 유혹에 약한',
    title: '할인에 약한 가성비 착시 쇼퍼',
    categoryLabel: '세일·1+1·무료배송 착시 중심',
    shareRatio: '전체 진단 참여자 중 약 14%',
    desc: '합리적인 소비를 추구한다고 생각하지만 실제로는 마감 특가, 1+1 행사, 무료배송 기준 채우기, 카드 전월 실적 채우기에 설득당해 계획에 없던 지출을 늘리는 유형입니다. 얼마나 싸게 샀는지가 아니라 ‘안 사면 100% 절약’이라는 기준점 전환이 필요합니다.',
    keyHabit: '무료배송 기준 맞추기 추가 구매 · 1+1 및 쿠폰 소멸 임박 소비',
    prescription: '무료배송 억지 담기 금지 및 1회 사용 비용 계산 습관',
    bestMatch: {
      name: '밸런스 잡힌 스마트 실속파',
      desc: '진짜 필요한 소비인지, 단순히 할인율 때문에 사는 것인지 객관적으로 짚어주는 조언자',
    },
    worstMatch: {
      name: '도파민 추구형 욜로 플렉서',
      desc: '세일 명분을 서로 합리화해 주며 계획에 없던 택배 상자를 늘리기 쉬운 조합',
    },
  },
  T5: {
    id: 'T5',
    index: '05',
    shortName: '스마트 실속파',
    subPhrase: '안정적인 균형 감각을 갖춘',
    title: '밸런스 잡힌 스마트 실속파',
    categoryLabel: '전반 양호 · 부분 약점 보완형',
    shareRatio: '전체 진단 참여자 중 약 15%',
    desc: '극단적인 과소비나 치명적인 재무 누수 없이 삶의 만족도와 저축 사이에서 건강한 균형을 유지하고 있는 상위권 소비자입니다. 바쁜 일상 속에서 한두 가지 취약 영역(소액 외식비나 미처 못 챙긴 구독·예산 복기 등)만 정밀하게 다듬으면 최상위 마스터 단계로 도약할 수 있습니다.',
    keyHabit: '대체로 균형 잡힌 지출 · 특정 1~2개 영역의 미세한 누수 잔존',
    prescription: '취약 영역 TOP 2 집중 보완 및 주간 5분 지출 리뷰',
    bestMatch: {
      name: '빈틈없는 시스템 짠테크 마스터',
      desc: '남아 있는 작은 지출 구멍을 메우고 저축·투자 효율을 한 단계 끌어올려 주는 파트너',
    },
    worstMatch: {
      name: '도파민 추구형 욜로 플렉서',
      desc: '잡아둔 주간 예산 밸런스가 상대방의 즉흥적인 쇼핑·외식 제안에 흔들릴 수 있는 조합',
    },
  },
  T6: {
    id: 'T6',
    index: '06',
    shortName: '짠테크 마스터',
    subPhrase: '자동화 자산 관리가 내재화된',
    title: '빈틈없는 시스템 짠테크 마스터',
    categoryLabel: '선저축·예산·고정비 완성형',
    shareRatio: '전체 진단 참여자 중 상위 10%',
    desc: '의지력에 기대지 않고 선저축 자동이체, 통장 쪼개기, 고정비 최적화, 비상금 방어선까지 시스템으로 구축한 최상위 재무 관리자입니다. 불필요한 감정 소비와 착시 할인을 정확히 걸러내며, 이제는 단순 절약을 넘어 목적 자금별 복리 운용과 소비 번아웃 방지에 집중할 단계입니다.',
    keyHabit: '급여일 자동 통장 쪼개기 · 할부 없는 일시불 및 비상금 계좌 완비',
    prescription: '목적 자금별 복리 포트폴리오 운용 및 계획적 리프레시 예산 유지',
    bestMatch: {
      name: '밸런스 잡힌 스마트 실속파',
      desc: '가치관 충돌 없이 미래 자산 목표를 함께 설계하며 건강한 여가 밸런스를 나누는 파트너',
    },
    worstMatch: {
      name: '숨만 쉬어도 빠져나가는 고정비 누수형',
      desc: '방치된 구독료와 무이자 할부 내역을 볼 때마다 답답함을 느끼기 쉬운 극과 극 조합',
    },
  },
};

export const DOMAIN_MISSIONS: Record<DomainKey, [string, string]> = {
  plan: [
    '급여/용돈 입금일 기준 저축·고정비·생활비 통장을 분리하고 주간 가용 생활비 한도 확정하기',
    '매주 일요일 밤 5분간 가계부 앱을 열어 이번 주 초과 지출 카테고리 1개만 피드백하기',
  ],
  impulse: [
    '5만 원 이상 비계획 상품은 결제 전 반드시 ‘48시간 장바구니 숙려제’ 거치기',
    '쇼핑 앱 마케팅 푸시 알림을 모두 끄고 스트레스 해소용 무지출 대체 루틴 2가지 적어두기',
  ],
  micro: [
    '주간 카페·배달·편의점 전용 체크카드에 일주일 예산(4~5만 원)만 충전해 한도 내로 쓰기',
    '배달 앱 주문 전 포장 할인/집 간편식을 먼저 확인하고 평일 텀블러 사용으로 주 3회 커피값 방어하기',
  ],
  fixed: [
    '오늘 바로 앱스토어·카드사 정기결제 목록을 열어 최근 2주간 안 쓴 OTT·멤버십 즉시 해지하기',
    '약정 끝난 통신 요금제를 알뜰폰/결합 요금제로 비교 전환하고 신규 무이자 할부 3개월간 중단하기',
  ],
  value: [
    '무료배송 기준이나 카드 실적을 채우기 위한 끼워 넣기 구매 금지(필요 시 배송비만 지불하기)',
    '1+1·마감 세일 발견 시 “정가였어도 오늘 내 돈 주고 샀을까?” 3초 자문 후 결제하기',
  ],
  saving: [
    '수입 입금 당일 오전 자동이체로 최소 25~40%가 선저축 계좌로 먼저 빠져나가게 세팅하기',
    '체크카드가 연결되지 않은 고금리 파킹통장/CMA를 개설해 최소 1~3개월 치 비상금 분리 보관하기',
  ],
};

export const DOMAIN_SOLUTIONS: Record<DomainKey, SolutionGuide> = {
  plan: {
    key: 'plan',
    tag: '예산·통장 시스템화',
    title: '자동 통장 쪼개기 및 주간 예산 봉투 시스템',
    desc: '월 단위로 예산을 잡으면 월초에 과소비하고 월말에 빠듯해집니다. 통장을 역할별로 분리하고 변동 생활비를 주 단위로 쪼개는 것이 핵심입니다.',
    steps: [
      '수입 통장 → 고정비 통장(자동이체 전용) → 변동생활비 체크카드 → 비상금 파킹통장 4단계 흐름을 만듭니다.',
      '한 달 변동 생활비가 40만 원이라면 한 번에 넣지 않고 매주 월요일 10만 원씩 자동이체되도록 설정합니다.',
      '매주 일요일 밤 잔액이 남으면 비상금 통장으로 이체해 소소한 성취 보상을 만듭니다.',
    ],
  },
  impulse: {
    key: 'impulse',
    tag: '도파민·충동 브레이크',
    title: '48시간 장바구니 냉각기 및 원클릭 결제 해제법',
    desc: '충동구매의 상당수는 결제 과정이 너무 쉽고 빠르기 때문에 일어납니다. 결제 마찰력을 의도적으로 높여 즉흥적 흥분을 가라앉히세요.',
    steps: [
      '자주 쓰는 패션·쇼핑몰 앱의 마케팅 야간 푸시 알림을 즉시 OFF 처리합니다.',
      '간편결제 원클릭 비밀번호 대신 일반 결제 방식을 두어 결제 직전 10초 생각할 틈을 만듭니다.',
      '사고 싶은 아이템은 캡처 후 ‘위시 메모장’에 가격과 이유를 적고 48시간 뒤에도 필요하면 구매합니다.',
    ],
  },
  micro: {
    key: 'micro',
    tag: '소액 반복 누수 차단',
    title: '카페·배달·편의점 주간 총량제 체크카드 전략',
    desc: '건당 5천~2만 원 지출은 가계부를 일일이 쓰기보다 전용 체크카드 한 장으로 주간 총량만 통제할 때 스트레스가 적고 효과가 확실합니다.',
    steps: [
      '카페·배달·편의점 결제에만 사용하는 전용 체크카드(또는 선불 머니) 1개를 지정합니다.',
      '이번 주 허용 횟수(예: 카페 2회 + 배달 1회)에 해당하는 금액만 월요일 아침에 충전합니다.',
      '배달 앱 최소주문금액을 맞추기 위한 사이드 추가 대신 동네 포장 픽업이나 냉동 간편식을 활용합니다.',
    ],
  },
  fixed: {
    key: 'fixed',
    tag: '고정비 구조조정',
    title: '30분 숨은 정기구독 정리 및 알뜰폰·일시불 전환',
    desc: '변동비를 매일 참는 것보다 고정비 5만 원을 한 번 깎는 것이 1년 60만 원 확정 절약을 만드는 가장 효율적인 방법입니다.',
    steps: [
      '스마트폰 설정의 구독 메뉴 및 카드사 앱 ‘정기결제 관리’에서 월 2회 미만 사용 서비스를 해지합니다.',
      '통신사 약정이 끝났다면 동일 통신망 알뜰폰 유심 요금제(월 1~2만 원대)로 전환해 매달 3~4만 원을 절감합니다.',
      '기존 할부 잔액부터 우선 정리하고 향후 3개월간 무이자 할부 없이 일시불 원칙을 적용합니다.',
    ],
  },
  value: {
    key: 'value',
    tag: '할인 착시 디톡스',
    title: '1+1·무료배송 함정 탈출 및 1회 사용 비용 계산법',
    desc: '할인율 숫자에 현혹되면 집에 안 쓰는 재고만 쌓입니다. 지출 총액과 실제 사용 횟수 기준으로 소비 판단 공식을 바꾸세요.',
    steps: [
      '무료배송까지 7,000원이 부족할 때 불필요한 상품을 담는 대신 3,000원 배송비를 내어 4,000원을 아낍니다.',
      '카드 전월 실적을 채우려고 월말에 억지 쇼핑을 하고 있다면 무실적 혜택 카드나 체크카드로 교체합니다.',
      '구매 전 “이 물건을 최소 20번 이상 쓸 것인가?” 자문해 1회당 사용 비용이 합리적인지 점검합니다.',
    ],
  },
  saving: {
    key: 'saving',
    tag: '선저축·비상금 자동화',
    title: '입금일 강제 선저축 및 고금리 파킹통장 방어선',
    desc: '쓰고 남은 돈을 저축하면 자금이 모이기 어렵습니다. 저축을 가장 먼저 빠져나가는 고정 항목으로 자동화하세요.',
    steps: [
      '적금·투자 자동이체일을 급여/용돈 입금일 당일 또는 익일 오전에 배치해 생활비와 원천 분리합니다.',
      '입출금 카드가 없는 고금리 파킹통장(또는 CMA)을 만들어 월 필수 생활비 1~3개월 치 비상금을 모읍니다.',
      '경조사·병원비 등 비정기 지출은 적금을 깨지 않고 비상금 통장에서만 꺼내 쓴 뒤 다음 달에 채워 넣습니다.',
    ],
  },
};

export function estimateTopPercentile(score: number): number {
  if (score >= 92) return 4;
  if (score >= 85) return 9;
  if (score >= 78) return 18;
  if (score >= 70) return 29;
  if (score >= 60) return 44;
  if (score >= 50) return 60;
  if (score >= 38) return 76;
  return 89;
}

export function runPrecisionEngine(segment: Segment, answersArr: (number | null)[]): AnalysisResult {
  const bank = QUIZ_BANK[segment];
  const domainRaw: Record<DomainKey, number[]> = {
    plan: [],
    impulse: [],
    micro: [],
    fixed: [],
    value: [],
    saving: [],
  };

  const itemRecords: ItemRecord[] = [];

  answersArr.forEach((ansIdx, qIdx) => {
    const safeIdx = ansIdx !== null && ansIdx >= 0 && ansIdx <= 4 ? ansIdx : 2;
    const qObj = bank[qIdx];
    const chosenOpt = qObj.options[safeIdx];
    domainRaw[qObj.domain].push(chosenOpt.score);

    itemRecords.push({
      qIndex: qIdx + 1,
      domain: qObj.domain,
      topic: qObj.topic,
      question: qObj.q,
      selectedIndex: safeIdx,
      selectedText: chosenOpt.text,
      score: chosenOpt.score,
    });
  });

  const domainScores = {} as Record<DomainKey, number>;
  let sumDomains = 0;
  DOMAINS.forEach((d) => {
    const arr = domainRaw[d.key];
    const avg = Math.round((arr[0] + arr[1]) / 2);
    domainScores[d.key] = avg;
    sumDomains += avg;
  });

  const totalScore = Math.round(sumDomains / 6);
  const topPercentile = estimateTopPercentile(totalScore);

  const deficits: Record<DomainKey, number> = {
    impulse: 100 - domainScores.impulse,
    micro: 100 - domainScores.micro,
    fixed: 100 - domainScores.fixed,
    value: 100 - domainScores.value,
    plan: 100 - domainScores.plan,
    saving: 100 - domainScores.saving,
  };

  const riskCandidates: { typeKey: PrecisionType['id']; label: string; score: number }[] = [
    {
      typeKey: 'T1',
      label: '도파민·충동 소비 기질',
      score: deficits.impulse * 1.18 + deficits.plan * 0.25 + deficits.saving * 0.15,
    },
    {
      typeKey: 'T2',
      label: '소확행 소액누수 기질',
      score: deficits.micro * 1.18 + deficits.plan * 0.22 + deficits.impulse * 0.12,
    },
    {
      typeKey: 'T3',
      label: '고정비·구독 방치 기질',
      score: deficits.fixed * 1.18 + deficits.plan * 0.2 + deficits.saving * 0.15,
    },
    {
      typeKey: 'T4',
      label: '세일·가성비 착시 기질',
      score: deficits.value * 1.18 + deficits.impulse * 0.22 + deficits.micro * 0.1,
    },
  ];
  const riskScores = riskCandidates.sort((a, b) => b.score - a.score);

  const minDomainScore = Math.min(...Object.values(domainScores));

  let primaryTypeKey: PrecisionType['id'] = 'T2';
  let subTendencyText = '';

  if (totalScore >= 82 && minDomainScore >= 62) {
    primaryTypeKey = 'T6';
    subTendencyText =
      domainScores.value >= 85 ? '가성비 분별력까지 균형 잡힌' : '선저축 자동화가 탄탄한';
  } else if (totalScore >= 66 && minDomainScore >= 50) {
    primaryTypeKey = 'T5';
    subTendencyText =
      riskScores[0].score > 25 ? `살짝 ${riskScores[0].label}이 섞인` : '전 영역 고른 밸런스의';
  } else {
    primaryTypeKey = riskScores[0].typeKey;
    if (riskScores[1].score >= 30) {
      subTendencyText = `${riskScores[1].label}이 함께 섞인`;
    } else if (deficits.saving >= 50) {
      subTendencyText = '저축 방어선 보강이 시급한';
    } else {
      subTendencyText = PRECISION_TYPES[primaryTypeKey].subPhrase;
    }
  }

  const sortedWeakDomains: WeakDomainReport[] = [...DOMAINS]
    .map((d) => ({
      ...d,
      score: domainScores[d.key],
      relatedItems: itemRecords
        .filter((r) => r.domain === d.key)
        .sort((a, b) => a.score - b.score),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.relatedItems[0].score - b.relatedItems[0].score;
    });

  return {
    totalScore,
    topPercentile,
    domainScores,
    primaryTypeKey,
    subTendencyText,
    weakTop2: [sortedWeakDomains[0], sortedWeakDomains[1]],
    itemRecords,
  };
}

export function deriveInitialSlidersFromAnswers(
  answers: (number | null)[],
  domainScores: Record<DomainKey, number>
): SliderValues {
  const qImpulse = answers[2] ?? 2;
  const qCafe = answers[4] ?? 2;
  const qDeliv = answers[5] ?? 2;

  return {
    cafe: Math.max(1, Math.min(6, qCafe + 1)),
    delivery: Math.max(1, Math.min(4, Math.ceil((qDeliv + 1) * 0.8))),
    impulse: Math.max(1, Math.min(5, qImpulse + 1)),
    fixed: domainScores.fixed <= 50 ? 4 : 2,
    micro: Math.max(1, Math.min(5, qCafe + 1)),
  };
}

export function computeSimulatorMetrics(
  segment: Segment,
  sliders: SliderValues,
  wishlist: WishlistGoal
) {
  const units = SEGMENT_META[segment].units;
  const mCafe = sliders.cafe * units.cafe * 4;
  const mDelivery = sliders.delivery * units.delivery * 4;
  const mImpulse = sliders.impulse * units.impulse;
  const mFixed = sliders.fixed * 10000;
  const mMicro = sliders.micro * units.micro * 4;

  const monthlyTotal = mCafe + mDelivery + mImpulse + mFixed + mMicro;
  const yearlyTotal = monthlyTotal * 12;

  const r = 0.04 / 12;
  const n = 36;
  const compound3Yr =
    monthlyTotal > 0 ? Math.round(monthlyTotal * (((Math.pow(1 + r, n) - 1) / r) * (1 + r))) : 0;

  const safePrice = Math.max(10000, wishlist.amount || 900000);
  const yearPercent = Math.round((yearlyTotal / safePrice) * 100);
  const monthsNeeded = monthlyTotal > 0 ? Math.ceil((safePrice / monthlyTotal) * 10) / 10 : null;

  return {
    monthlyTotal,
    yearlyTotal,
    compound3Yr,
    safePrice,
    yearPercent,
    monthsNeeded,
  };
}
