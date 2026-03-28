// src/components/student/sections/MyResults.jsx
import React, { useState, useMemo } from 'react';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import Modal from '../../common/Modal';
import EmptyState from '../../common/EmptyState';

const MyResults = ({ results, questions, onNavigate }) => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const subjects = useMemo(() => {
    const subs = new Set();
    results.forEach(r => {
      if (r.subject) subs.add(r.subject);
      if (r.category) subs.add(r.category);
    });
    return Array.from(subs).sort();
  }, [results]);

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    if (filterSubject !== 'all') {
      filtered = filtered.filter(r =>
        r.subject === filterSubject || r.category === filterSubject
      );
    }

    if (filterScore !== 'all') {
      switch (filterScore) {
        case 'excellent': filtered = filtered.filter(r => (r.percentage || 0) >= 80); break;
        case 'good': filtered = filtered.filter(r => (r.percentage || 0) >= 60 && (r.percentage || 0) < 80); break;
        case 'average': filtered = filtered.filter(r => (r.percentage || 0) >= 40 && (r.percentage || 0) < 60); break;
        case 'poor': filtered = filtered.filter(r => (r.percentage || 0) < 40); break;
        default: break;
      }
    }

    switch (sortOrder) {
      case 'newest':
        filtered.sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => (a.completedAt?.seconds || 0) - (b.completedAt?.seconds || 0));
        break;
      case 'highest':
        filtered.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
        break;
      case 'lowest':
        filtered.sort((a, b) => (a.percentage || 0) - (b.percentage || 0));
        break;
      default: break;
    }

    return filtered;
  }, [results, filterSubject, filterScore, sortOrder]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (results.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="No Results Yet"
        description="Take your first quiz to see your results here!"
        action={{ label: 'Browse Quizzes', onClick: () => onNavigate('quiz-browser') }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-blue-600">{results.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Tests</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {Math.round(results.reduce((s, r) => s + (r.percentage || 0), 0) / results.length)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Average Score</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {Math.max(...results.map(r => r.percentage || 0))}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Best Score</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {results.reduce((s, r) => s + (r.correctAnswers || 0), 0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Correct Answers</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterScore}
          onChange={(e) => setFilterScore(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        >
          <option value="all">All Scores</option>
          <option value="excellent">Excellent (80%+)</option>
          <option value="good">Good (60-80%)</option>
          <option value="average">Average (40-60%)</option>
          <option value="poor">Needs Work (&lt;40%)</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Score</option>
          <option value="lowest">Lowest Score</option>
        </select>
        <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-auto">
          {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.map((result, idx) => (
          <Card
            key={result.id || idx}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedResult(result)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                  (result.percentage || 0) >= 80 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                  (result.percentage || 0) >= 60 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                  (result.percentage || 0) >= 40 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                  'bg-gradient-to-br from-red-400 to-red-600'
                }`}>
                  {Math.round(result.percentage || 0)}%
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">
                    {result.title || result.subject || 'Quiz'}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {result.correctAnswers || 0}/{result.totalQuestions || 0} correct •{' '}
                    {formatDuration(result.timeTaken)} •{' '}
                    {formatDate(result.completedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {result.mode && (
                  <Badge color={result.mode === 'practice' ? 'blue' : 'purple'} size="sm">
                    {result.mode}
                  </Badge>
                )}
                <Badge
                  color={(result.percentage || 0) >= 80 ? 'green' : (result.percentage || 0) >= 60 ? 'yellow' : 'red'}
                  size="sm"
                >
                  {(result.percentage || 0) >= 80 ? 'Excellent' :
                   (result.percentage || 0) >= 60 ? 'Good' :
                   (result.percentage || 0) >= 40 ? 'Average' : 'Needs Work'}
                </Badge>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No Results Found"
          description="Try adjusting your filters."
        />
      )}

      {/* Result Detail Modal */}
      {selectedResult && (
        <Modal
          isOpen={!!selectedResult}
          onClose={() => setSelectedResult(null)}
          title="Result Details"
          size="lg"
        >
          <div className="space-y-4">
            {/* Score Header */}
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className={`text-5xl font-bold ${
                (selectedResult.percentage || 0) >= 80 ? 'text-emerald-600' :
                (selectedResult.percentage || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(selectedResult.percentage || 0)}%
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {selectedResult.correctAnswers || 0} of {selectedResult.totalQuestions || 0} correct
              </p>
              <div className="flex justify-center gap-4 mt-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ⏱️ {formatDuration(selectedResult.timeTaken)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  📅 {formatDate(selectedResult.completedAt)}
                </span>
              </div>
            </div>

            {/* Answer Breakdown */}
            {selectedResult.answers && selectedResult.answers.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Answer Breakdown</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedResult.answers.map((answer, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        answer.isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">
                          {answer.isCorrect ? '✅' : '❌'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">
                            Q{idx + 1}: {answer.question || 'Question'}
                          </p>
                          {!answer.isCorrect && (
                            <div className="mt-1 space-y-0.5">
                              <p className="text-xs text-red-600 dark:text-red-400">
                                Your answer: {answer.selectedAnswer || 'Not answered'}
                              </p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                Correct: {answer.correctAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyResults;
