// src/components/student/sections/PerformanceAnalytics.jsx
import React, { useMemo } from 'react';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import { LineChart } from '../../common/ChartWrapper';
import EmptyState from '../../common/EmptyState';

const PerformanceAnalytics = ({ results, questions }) => {
  const overallStats = useMemo(() => {
    if (results.length === 0) return null;
    const totalQ = results.reduce((s, r) => s + (r.totalQuestions || 0), 0);
    const totalCorrect = results.reduce((s, r) => s + (r.correctAnswers || 0), 0);
    const avgScore = Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length);
    const bestScore = Math.max(...results.map(r => r.percentage || 0));
    const worstScore = Math.min(...results.map(r => r.percentage || 0));
    const totalTime = results.reduce((s, r) => s + (r.timeTaken || 0), 0);

    return { totalQ, totalCorrect, avgScore, bestScore, worstScore, totalTime };
  }, [results]);

  const scoreDistribution = useMemo(() => {
    const ranges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    results.forEach(r => {
      const p = r.percentage || 0;
      if (p <= 20) ranges['0-20']++;
      else if (p <= 40) ranges['21-40']++;
      else if (p <= 60) ranges['41-60']++;
      else if (p <= 80) ranges['61-80']++;
      else ranges['81-100']++;
    });
    return ranges;
  }, [results]);

  const scoreOverTime = useMemo(() => {
    return [...results]
      .sort((a, b) => (a.completedAt?.seconds || 0) - (b.completedAt?.seconds || 0))
      .map((r, idx) => ({
        label: `Test ${idx + 1}`,
        value: Math.round(r.percentage || 0)
      }));
  }, [results]);

  const subjectAnalysis = useMemo(() => {
    const subjects = {};
    results.forEach(r => {
      const subject = r.subject || r.category || 'General';
      if (!subjects[subject]) {
        subjects[subject] = { scores: [], total: 0, correct: 0, time: 0 };
      }
      subjects[subject].scores.push(r.percentage || 0);
      subjects[subject].total += r.totalQuestions || 0;
      subjects[subject].correct += r.correctAnswers || 0;
      subjects[subject].time += r.timeTaken || 0;
    });

    return Object.entries(subjects).map(([name, data]) => ({
      name,
      avgScore: Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length),
      tests: data.scores.length,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      avgTime: data.total > 0 ? Math.round(data.time / data.total) : 0,
      trend: data.scores.length >= 2
        ? data.scores[data.scores.length - 1] - data.scores[0]
        : 0
    })).sort((a, b) => b.tests - a.tests);
  }, [results]);

  const difficultyAnalysis = useMemo(() => {
    const difficulties = { easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } };
    results.forEach(r => {
      r.answers?.forEach(a => {
        const diff = a.difficulty || 'medium';
        if (difficulties[diff]) {
          difficulties[diff].total++;
          if (a.isCorrect) difficulties[diff].correct++;
        }
      });
    });
    return Object.entries(difficulties).map(([level, data]) => ({
      level,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }));
  }, [results]);

  if (results.length === 0) {
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
          { label: 'Tests', value: results.length },
          { label: 'Avg', value: `${overallStats.avgScore}%` },
          { label: 'Best', value: `${overallStats.bestScore}%` },
          { label: 'Worst', value: `${overallStats.worstScore}%` },
          { label: 'Accuracy', value: `${Math.round((overallStats.totalCorrect / overallStats.totalQ) * 100)}%` },
          { label: 'Time', value: `${Math.round(overallStats.totalTime / 60)}m` }
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
