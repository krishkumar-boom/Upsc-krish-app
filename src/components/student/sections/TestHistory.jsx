// src/components/student/sections/TestHistory.jsx
import React, { useMemo } from 'react';
import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';

const TestHistory = ({ results, questions }) => {
  const groupedByDate = useMemo(() => {
    const groups = {};
    results.forEach(r => {
      const date = r.completedAt?.seconds
        ? new Date(r.completedAt.seconds * 1000)
        : r.completedAt instanceof Date ? r.completedAt : new Date();
      const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return Object.entries(groups);
  }, [results]);

  const progressOverTime = useMemo(() => {
    if (results.length < 2) return null;
    const sorted = [...results].sort((a, b) =>
      (a.completedAt?.seconds || 0) - (b.completedAt?.seconds || 0)
    );
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const avgFirst = Math.round(firstHalf.reduce((s, r) => s + (r.percentage || 0), 0) / firstHalf.length);
    const avgSecond = Math.round(secondHalf.reduce((s, r) => s + (r.percentage || 0), 0) / secondHalf.length);

    return {
      earlier: avgFirst,
      recent: avgSecond,
      improvement: avgSecond - avgFirst
    };
  }, [results]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (results.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="No Test History"
        description="Your test timeline will appear here after you take quizzes."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Progress Summary */}
      {progressOverTime && (
        <Card className={`border-l-4 ${progressOverTime.improvement >= 0 ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
          <div className="flex items-center gap-4">
            <span className="text-3xl">{progressOverTime.improvement >= 0 ? '📈' : '📉'}</span>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {progressOverTime.improvement >= 0
                  ? `You've improved by ${progressOverTime.improvement}%!`
                  : `Your scores dropped by ${Math.abs(progressOverTime.improvement)}%`}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Earlier average: {progressOverTime.earlier}% → Recent average: {progressOverTime.recent}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline */}
      {groupedByDate.map(([month, monthResults]) => (
        <div key={month}>
          <h3 className="font-semibold text-gray-600 dark:text-gray-400 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {month}
            <span className="text-xs font-normal">({monthResults.length} test{monthResults.length !== 1 ? 's' : ''})</span>
          </h3>

          <div className="space-y-2 ml-3 border-l-2 border-gray-200 dark:border-gray-700 pl-6">
            {monthResults.map((result, idx) => (
              <div key={result.id || idx} className="relative">
                <div className="absolute -left-[31px] top-3 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 shadow-sm bg-gradient-to-br from-blue-400 to-blue-600" />
                <Card className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                        (result.percentage || 0) >= 80 ? 'bg-emerald-500' :
                        (result.percentage || 0) >= 60 ? 'bg-yellow-500' :
                        (result.percentage || 0) >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {Math.round(result.percentage || 0)}%
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {result.title || result.subject || 'Quiz'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(result.completedAt)} • {result.correctAnswers || 0}/{result.totalQuestions || 0} correct
                        </p>
                      </div>
                    </div>
                    {result.mode && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        result.mode === 'practice'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {result.mode}
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Total Stats */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold">{results.length}</p>
            <p className="text-blue-200 text-sm">Total Tests</p>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {results.reduce((s, r) => s + (r.totalQuestions || 0), 0)}
            </p>
            <p className="text-blue-200 text-sm">Questions Answered</p>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {Math.round(results.reduce((s, r) => s + (r.timeTaken || 0), 0) / 60)}m
            </p>
            <p className="text-blue-200 text-sm">Total Time</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestHistory;
