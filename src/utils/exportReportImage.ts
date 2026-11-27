import {
  AnalysisResult,
  DOMAINS,
  PRECISION_TYPES,
  SEGMENT_META,
  Segment,
} from '../data/spendingData';

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const chars = text.split('');
  let line = '';
  let currY = y;

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currY);
      line = chars[i];
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.length > 0) {
    ctx.fillText(line, x, currY);
    currY += lineHeight;
  }
  return currY;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function exportReportCardPng(
  analysis: AnalysisResult,
  segment: Segment,
  yearlySavings: number,
  compound3Yr: number
): Promise<boolean> {
  try {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready;
    }
    const width = 1080;
    const height = 1380;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const pType = PRECISION_TYPES[analysis.primaryTypeKey];
    const segMeta = SEGMENT_META[segment];

    // Warm ivory background
    ctx.fillStyle = '#FAF8F3';
    ctx.fillRect(0, 0, width, height);

    // Outer editorial container card
    drawRoundedRect(ctx, 48, 48, width - 96, height - 96, 28);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#E5DFD3';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top metadata line
    ctx.fillStyle = '#1F4E3D';
    ctx.font = '700 22px Pretendard, sans-serif';
    ctx.fillText('머니체크 · 소비 습관 정밀 진단 리포트', 96, 118);

    ctx.fillStyle = '#7D776C';
    ctx.font = '500 20px Pretendard, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(segMeta.badge, width - 96, 118);
    ctx.textAlign = 'left';

    // Hairline divider
    ctx.strokeStyle = '#E5DFD3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(96, 146);
    ctx.lineTo(width - 96, 146);
    ctx.stroke();

    // Subtitle + Main Type Title
    ctx.fillStyle = '#57534C';
    ctx.font = '600 24px Pretendard, sans-serif';
    ctx.fillText(`${analysis.subTendencyText} · ${pType.categoryLabel}`, 96, 198);

    ctx.fillStyle = '#1E1D1A';
    ctx.font = '700 44px Hahmlet, Pretendard, serif';
    ctx.fillText(pType.title, 96, 256);

    // Score Box
    drawRoundedRect(ctx, 96, 294, width - 192, 164, 20);
    ctx.fillStyle = '#F2EFE7';
    ctx.fill();

    // Score Circle
    const ringCx = 186;
    const ringCy = 376;
    const ringR = 52;
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = '#DDD5C5';
    ctx.lineWidth = 11;
    ctx.stroke();

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * analysis.totalScore) / 100;
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, ringR, startAngle, endAngle);
    ctx.strokeStyle =
      analysis.totalScore >= 80
        ? '#1F4E3D'
        : analysis.totalScore >= 60
        ? '#B5781D'
        : '#B43C32';
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.fillStyle = '#1E1D1A';
    ctx.font = '700 34px "IBM Plex Mono", Pretendard, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${analysis.totalScore}`, ringCx, ringCy + 8);
    ctx.fillStyle = '#7D776C';
    ctx.font = '600 15px Pretendard, sans-serif';
    ctx.fillText('/ 100점', ringCx, ringCy + 30);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#1F4E3D';
    ctx.font = '700 22px Pretendard, sans-serif';
    ctx.fillText(`종합 소비 건강 점수 · 상위 ${analysis.topPercentile}%`, 276, 356);

    ctx.fillStyle = '#57534C';
    ctx.font = '500 20px Pretendard, sans-serif';
    ctx.fillText(pType.shareRatio, 276, 392);
    ctx.fillText(`핵심 처방: ${pType.prescription}`, 276, 424);

    // Description block
    ctx.fillStyle = '#57534C';
    ctx.font = '400 21px Pretendard, sans-serif';
    const afterDescY = wrapCanvasText(ctx, pType.desc, 96, 510, width - 192, 33);

    // Hexagon Radar Chart on left + 6 domain bars on right
    const sectionTopY = Math.max(645, afterDescY + 24);
    ctx.fillStyle = '#1E1D1A';
    ctx.font = '700 24px Pretendard, sans-serif';
    ctx.fillText('6대 소비 역량 다차원 분석', 96, sectionTopY);

    const radarCx = 310;
    const radarCy = sectionTopY + 195;
    const radarR = 122;

    const getPt = (idx: number, ratio: number) => {
      const ang = -Math.PI / 2 + idx * ((Math.PI * 2) / 6);
      return {
        x: radarCx + radarR * ratio * Math.cos(ang),
        y: radarCy + radarR * ratio * Math.sin(ang),
      };
    };

    [0.25, 0.5, 0.75, 1].forEach((lvl) => {
      ctx.beginPath();
      DOMAINS.forEach((_, idx) => {
        const pt = getPt(idx, lvl);
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.strokeStyle = lvl === 1 ? '#CFC7B7' : '#E5DFD3';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    DOMAINS.forEach((_, idx) => {
      const pt = getPt(idx, 1);
      ctx.beginPath();
      ctx.moveTo(radarCx, radarCy);
      ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = '#EAE4D7';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // Benchmark 70
    ctx.beginPath();
    ctx.setLineDash([6, 5]);
    DOMAINS.forEach((_, idx) => {
      const pt = getPt(idx, 0.7);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.strokeStyle = '#B5781D';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // User Polygon
    ctx.beginPath();
    DOMAINS.forEach((d, idx) => {
      const ratio = Math.max(0.08, analysis.domainScores[d.key] / 100);
      const pt = getPt(idx, ratio);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(31, 78, 61, 0.18)';
    ctx.fill();
    ctx.strokeStyle = '#1F4E3D';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Radar vertex labels
    DOMAINS.forEach((d, idx) => {
      const sc = analysis.domainScores[d.key];
      const pt = getPt(idx, Math.max(0.08, sc / 100));
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#1F4E3D';
      ctx.fill();

      const lp = getPt(idx, 1.28);
      ctx.textAlign = idx === 1 || idx === 2 ? 'left' : idx === 4 || idx === 5 ? 'right' : 'center';
      ctx.fillStyle = '#1E1D1A';
      ctx.font = '700 16px Pretendard, sans-serif';
      ctx.fillText(d.short, lp.x, lp.y - 4);
      ctx.fillStyle = '#1F4E3D';
      ctx.font = '600 15px "IBM Plex Mono", monospace';
      ctx.fillText(`${sc}점`, lp.x, lp.y + 16);
    });
    ctx.textAlign = 'left';

    // Domain bars on right
    const barX = 560;
    const barW = width - 96 - barX;
    DOMAINS.forEach((d, idx) => {
      const sc = analysis.domainScores[d.key];
      const yPos = sectionTopY + 54 + idx * 54;
      ctx.fillStyle = '#1E1D1A';
      ctx.font = '600 18px Pretendard, sans-serif';
      ctx.fillText(d.short, barX, yPos);

      ctx.textAlign = 'right';
      ctx.fillStyle = sc < 50 ? '#B43C32' : '#57534C';
      ctx.font = '600 18px "IBM Plex Mono", monospace';
      ctx.fillText(`${sc}점`, barX + barW, yPos);
      ctx.textAlign = 'left';

      drawRoundedRect(ctx, barX, yPos + 10, barW, 12, 6);
      ctx.fillStyle = '#F2EFE7';
      ctx.fill();

      if (sc > 0) {
        drawRoundedRect(ctx, barX, yPos + 10, Math.max(12, (barW * sc) / 100), 12, 6);
        ctx.fillStyle = sc >= 80 ? '#1F4E3D' : sc < 50 ? '#B43C32' : '#B5781D';
        ctx.fill();
      }
    });

    // Bottom Summary Box: Top 2 Leak Points + 3-Year Savings
    const leakBoxY = sectionTopY + 395;
    drawRoundedRect(ctx, 96, leakBoxY, width - 192, 235, 20);
    ctx.fillStyle = '#FAF8F3';
    ctx.fill();
    ctx.strokeStyle = '#E5DFD3';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#B43C32';
    ctx.font = '700 20px Pretendard, sans-serif';
    ctx.fillText('개인 응답 기반 핵심 누수 포인트 TOP 2', 128, leakBoxY + 42);

    const [w1, w2] = analysis.weakTop2;
    ctx.fillStyle = '#1E1D1A';
    ctx.font = '600 19px Pretendard, sans-serif';
    ctx.fillText(
      `1위. ${w1.short} (${w1.score}점) — ${w1.relatedItems[0].topic}`,
      128,
      leakBoxY + 84
    );
    ctx.fillText(
      `2위. ${w2.short} (${w2.score}점) — ${w2.relatedItems[0].topic}`,
      128,
      leakBoxY + 118
    );

    ctx.strokeStyle = '#E5DFD3';
    ctx.beginPath();
    ctx.moveTo(128, leakBoxY + 146);
    ctx.lineTo(width - 128, leakBoxY + 146);
    ctx.stroke();

    ctx.fillStyle = '#1F4E3D';
    ctx.font = '700 21px Pretendard, sans-serif';
    ctx.fillText(
      `맞춤 지출 다이어트 예상 성과: 1년 ${yearlySavings.toLocaleString('ko-KR')}원 · 3년 복리 ${compound3Yr.toLocaleString('ko-KR')}원`,
      128,
      leakBoxY + 194
    );

    // Footer imprint
    ctx.fillStyle = '#7D776C';
    ctx.font = '500 17px Pretendard, sans-serif';
    ctx.fillText('머니체크 소비 습관 진단 & 개선 리포트', 96, height - 82);

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `머니체크_소비습관진단_${pType.shortName}.png`;
    a.href = dataUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch {
    return false;
  }
}
