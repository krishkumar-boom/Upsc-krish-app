// src/components/student/sections/PerformanceAnalytics.jsx
import React, { useMemo } from 'react';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import ChartWrapper from '../../common/ChartWrapper';
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
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Tests', value: results.length, color: 'text-blue-600' },
          { label: 'Avg Score', value: `${overallStats.avgScore}%`, color: 'text-emerald-600' },
          { label: 'Best', value: `${Math.round(overallStats.bestScore)}%`, color: 'text-yellow-600' },
          { label: 'Worst', value: `${Math.round(overallStats.worstScore)}%`, color: 'text-red-600' },
          { label: 'Accuracy', value: `${overallStats.totalQ > 0 ? Math.round((overallStats.totalCorrect / overallStats.totalQ) * 100) : 0}%`, color: 'text-purple-600' },
          { label: 'Time', value: `${Math.round(overallStats.totalTime / 60)}m`, color: 'text-teal-600' }
        ].map((stat, idx) => (
          <Card key={idx} className="text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Score Over Time */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📈 Score Trend</h3>
        {scoreOverTime.length > 1 ? (
          <ChartWrapper data={scoreOverTime} type="line" height={200} color="#3b82f6" />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            Need at least 2 tests to show trend
          </p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📊 Score Distribution</h3>
          <div className="space-y-3">
            {Object.entries(scoreDistribution).map(([range, count]) => (
              <div key={range} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{range}%</span>
                <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 ${
                      range === '81-100' ? 'bg-emerald-500' :
                      range === '61-80' ? 'bg-blue-500' :
                      range === '41-60' ? 'bg-yellow-500' :
                      range === '21-40' ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(count / maxDist) * 100}%`, minWidth: count > 0 ? '24px' : '0' }}
                  >
                    {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Difficulty Breakdown */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">🎯 By Difficulty</h3>
          <div className="space-y-4">
            {difficultyAnalysis.map(d => (
              <div key={d.level}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      d.level === 'easy' ? 'bg-emerald-500' :
                      d.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    {d.level}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {d.correct}/{d.total} ({d.accuracy}%)
                  </span>
                </div>
                <ProgressBar
                  value={d.accuracy}
                  max={100}
                  color={d.level === 'easy' ? 'emerald' : d.level === 'medium' ? 'yellow' : 'red'}
                  size="md"
                />
              </div>
            ))}
            {difficultyAnalysis.every(d => d.total === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No difficulty data available
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Subject Analysis */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📚 Subject Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Subject</th>
                <th className="text-center py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Tests</th>
                <th className="text-center py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Avg Score</th>
                <th className="text-center py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Accuracy</th>
                <th className="text-center py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Avg Time/Q</th>
                <th className="text-center py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {subjectAnalysis.map(subject => (
                <tr key={subject.name} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-2 font-medium text-gray-800 dark:text-white">{subject.name}</td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">{subject.tests}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`font-bold ${
                      subject.avgScore >= 80 ? 'text-emerald-600' :
                      subject.avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {subject.avgScore}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">
                    {subject.accuracy}%
                  </td>
                  <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">
                    {subject.avgTime}s
                  </td>
                  <td className="py-3 px-2 text-center">
                    {subject.trend > 0 ? (
                      <span className="text-emerald-600">↑ {Math.round(subject.trend)}%</span>
                    ) : subject.trend < 0 ? (
                      <span className="text-red-600">↓ {Math.abs(Math.round(subject.trend))}%</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">💡 Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {generateInsights(overallStats, subjectAnalysis, difficultyAnalysis, results).map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-2xl">{insight.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{insight.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{insight.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const generateInsights = (stats, subjects, difficulties, results) => {
  const insights = [];

  // Best subject
  const bestSubject = subjects.reduce((best, s) => s.avgScore > (best?.avgScore || 0) ? s : best, null);
  if (bestSubject) {
    insights.push({
      icon: '🌟',
      title: `Strongest: ${bestSubject.name}`,
      text: `Average score of ${bestSubject.avgScore}% across ${bestSubject.tests} tests`
    });
  }

  // Weakest subject
  const worstSubject = subjects.reduce((worst, s) => s.avgScore < (worst?.avgScore || 100) ? s : worst, null);
  if (worstSubject && worstSubject.name !== bestSubject?.name) {
    insights.push({
      icon: '📖',
      title: `Focus on: ${worstSubject.name}`,
      text: `Average score of ${worstSubject.avgScore}%. Practice more to improve!`
    });
  }

  // Speed insight
  const avgTimePerQ = stats.totalQ > 0 ? Math.round(stats.totalTime / stats.totalQ) : 0;
  if (avgTimePerQ > 0) {
    insights.push({
      icon: '⏱️',
      title: `${avgTimePerQ}s per question`,
      text: avgTimePerQ > 90 ? 'Take your time but try to be slightly faster' :
            avgTimePerQ > 60 ? 'Good pace! Well balanced' :
            'Quick responses! Make sure accuracy stays high'
    });
  }

  // Consistency
  if (results.length >= 5) {
    const scores = results.map(r => r.percentage || 0);
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
    const variance = scores.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / scores.length;
    const stdDev = Math.round(Math.sqrt(variance));
    insights.push({
      icon: stdDev < 15 ? '🎯' : '📉',
      title: stdDev < 15 ? 'Very Consistent!' : 'Scores Vary',
      text: stdDev < 15
        ? `Your scores are steady with only ±${stdDev}% variation`
        : `Your scores vary by ±${stdDev}%. Try to be more consistent.`
    });
  }

  return insights.slice(0, 4);
};

export default PerformanceAnalytics;
