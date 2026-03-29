import React, { useMemo } from 'react';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import { LineChart } from '../../common/ChartWrapper';
import EmptyState from '../../common/EmptyState';

const PerformanceAnalytics = ({ results, questions }) => {

  // 🔥 SAFE FIX
  const safeResults = Array.isArray(results) ? results : [];

  const overallStats = useMemo(() => {
    if (safeResults.length === 0) return null;

    const totalQ = safeResults.reduce((s, r) => s + (r.totalQuestions || 0), 0);
    const totalCorrect = safeResults.reduce((s, r) => s + (r.correctAnswers || 0), 0);
    const avgScore = Math.round(
      safeResults.reduce((s, r) => s + (r.percentage || 0), 0) / safeResults.length
    );

    const bestScore = Math.max(...safeResults.map(r => r.percentage || 0));
    const worstScore = Math.min(...safeResults.map(r => r.percentage || 0));
    const totalTime = safeResults.reduce((s, r) => s + (r.timeTaken || 0), 0);

    return { totalQ, totalCorrect, avgScore, bestScore, worstScore, totalTime };
  }, [safeResults]);

  const scoreDistribution = useMemo(() => {
    const ranges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };

    safeResults.forEach(r => {
      const p = r.percentage || 0;
      if (p <= 20) ranges['0-20']++;
      else if (p <= 40) ranges['21-40']++;
      else if (p <= 60) ranges['41-60']++;
      else if (p <= 80) ranges['61-80']++;
      else ranges['81-100']++;
    });

    return ranges;
  }, [safeResults]);

  const scoreOverTime = useMemo(() => {
    return [...safeResults]
      .sort((a, b) => (a.completedAt?.seconds || 0) - (b.completedAt?.seconds || 0))
      .map((r, idx) => ({
        label: `Test ${idx + 1}`,
        value: Math.round(r.percentage || 0)
      }));
  }, [safeResults]);

  if (safeResults.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No Analytics Available"
        description="Complete some quizzes to see your performance analytics."
      />
    );
  }

  const maxDist = Math.max(...Object.values(scoreDistribution), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Tests', value: safeResults.length },
          { label: 'Avg', value: `${overallStats?.avgScore || 0}%` },
          { label: 'Best', value: `${overallStats?.bestScore || 0}%` },
          { label: 'Worst', value: `${overallStats?.worstScore || 0}%` },
          { label: 'Accuracy', value: `${overallStats?.totalQ > 0 ? Math.round((overallStats.totalCorrect / overallStats.totalQ) * 100) : 0}%` },
          { label: 'Time', value: `${Math.round((overallStats?.totalTime || 0) / 60)}m` }
        ].map((stat, i) => (
          <Card key={i} className="text-center">
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <h3 className="mb-4 font-semibold">Score Trend</h3>
        {scoreOverTime.length > 1 ? (
          <LineChart
            labels={scoreOverTime.map(i => i.label)}
            datasets={[{
              label: 'Score %',
              data: scoreOverTime.map(i => i.value),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.2)',
              fill: true,
              tension: 0.4
            }]}
            height={200}
          />
        ) : (
          <p className="text-center text-sm">Not enough data</p>
        )}
      </Card>

      {/* Distribution */}
      <Card>
        <h3 className="mb-4 font-semibold">Score Distribution</h3>
        {Object.entries(scoreDistribution).map(([r, c]) => (
          <div key={r} className="mb-2">
            {r}% → {c}
          </div>
        ))}
      </Card>

    </div>
  );
};

export default PerformanceAnalytics;
