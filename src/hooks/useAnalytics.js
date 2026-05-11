import { useMemo } from 'react';
import {
  calculateSemesterAvg,
  mean,
  stdDev,
  linearTrend,
  safeRound,
} from '../utils/math';

export const useAnalytics = (semesters) => {
  return useMemo(() => {
    const semAvgs = semesters.map((s) => calculateSemesterAvg(s.subjects));
    const validAvgs = semAvgs.filter((v) => v > 0);

    if (validAvgs.length === 0) {
      return { hasData: false };
    }

    // Grand Average
    const grandAvg = safeRound(mean(validAvgs), 2);

    // Trend (slope of linear regression across semesters)
    const trend = linearTrend(validAvgs);

    // Consistency Score 0–100 (100 = perfectly consistent)
    const sd = stdDev(validAvgs);
    const consistency =
      grandAvg > 0
        ? safeRound(Math.max(0, Math.min(100, 100 - (sd / grandAvg) * 100)), 1)
        : 0;

    // Momentum: avg of last half vs first half
    const half = Math.ceil(validAvgs.length / 2);
    const firstHalf = validAvgs.slice(0, half);
    const lastHalf = validAvgs.slice(-half);
    const momentum = safeRound(mean(lastHalf) - mean(firstHalf), 2);

    // Build subject map across all semesters
    const subjectMap = {};
    semesters.forEach((sem) => {
      sem.subjects.forEach((sub) => {
        const key = sub.name.trim().toLowerCase();
        const score = parseFloat(sub.score);
        if (key && !isNaN(score) && score > 0) {
          if (!subjectMap[key]) {
            subjectMap[key] = { name: sub.name.trim(), total: 0, count: 0 };
          }
          subjectMap[key].total += score;
          subjectMap[key].count += 1;
        }
      });
    });

    const subjectList = Object.values(subjectMap).map((s) => ({
      name: s.name,
      avg: safeRound(s.total / s.count, 1),
    }));

    const strongest =
      subjectList.length > 0
        ? subjectList.reduce((a, b) => (a.avg >= b.avg ? a : b))
        : null;
    const weakest =
      subjectList.length > 0
        ? subjectList.reduce((a, b) => (a.avg <= b.avg ? a : b))
        : null;

    // Radar data: top 6 subjects by avg
    const radarData = [...subjectList]
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 6)
      .map((s) => ({
        subject: s.name.length > 11 ? s.name.substring(0, 11) + '…' : s.name,
        nilai: s.avg,
        fullName: s.name,
      }));

    // Trend chart data per semester
    const trendData = semesters
      .map((sem, idx) => ({
        name: `S${idx + 1}`,
        label: sem.name,
        avg: semAvgs[idx] > 0 ? semAvgs[idx] : null,
      }))
      .filter((d) => d.avg !== null);

    // Semester-to-semester deltas
    const deltas = validAvgs.slice(1).map((v, i) =>
      safeRound(v - validAvgs[i], 2)
    );
    const bestDelta = deltas.length > 0 ? Math.max(...deltas) : 0;

    return {
      hasData: true,
      grandAvg,
      trend,
      consistency,
      momentum,
      strongest,
      weakest,
      radarData,
      trendData,
      semAvgs,
      validSems: validAvgs.length,
      deltas,
      bestDelta,
    };
  }, [semesters]);
};
