// src/components/student/sections/StudentDashboard.jsx
import React, { useMemo } from 'react';
import StatCard from '../../common/StatCard';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';
import WelcomeBanner from '../../common/WelcomeBanner';

const StudentDashboard = ({ user, results, questions, onNavigate, onStartTest }) => {
  const stats = useMemo(() => {
    const totalTests = results.length;
    const totalQuestions = results.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);
    const totalCorrect = results.reduce((sum, r) => sum + (r.correctAnswers || 0), 0);
    const avgScore = totalTests > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalTests)
      : 0;
    const bestScore = totalTests > 0
      ? Math.max(...results.map(r => r.percentage || 0))
      : 0;
    const totalTimeSpent = results.reduce((sum, r) => sum + (r.timeTaken || 0), 0);
    const streakDays = calculateStreak(results);

    return { totalTests, totalQuestions, totalCorrect, avgScore, bestScore, totalTimeSpent, streakDays };
  }, [results]);

  const recentResults = useMemo(() => results.slice(0, 5), [results]);

  const subjectBreakdown = useMemo(() => {
    const subjects = {};
    results.forEach(r => {
      const subject = r.subject || r.category || 'General';
      if (!subjects[subject]) {
        subjects[subject] = { total: 0, correct: 0, tests: 0, totalPercentage: 0 };
      }
      subjects[subject].total += r.totalQuestions || 0;
      subjects[subject].correct += r.correctAnswers || 0;
      subjects[subject].tests += 1;
      subjects[subject].totalPercentage += r.percentage || 0;
    });
    return Object.entries(subjects).map(([name, data]) => ({
      name,
      ...data,
      avgScore: Math.round(data.totalPercentage / data.tests)
    })).sort((a, b) => b.tests - a.tests);
  }, [results]);

  const availableSubjects = useMemo(() => {
    if (!questions) return [];
    const subjects = new Set();
    questions.forEach(q => {
      if (q.subject) subjects.add(q.subject);
      if (q.category) subjects.add(q.category);
    });
    return Array.from(subjects);
  }, [questions]);

  const quickStartConfig = (subject) => {
    const subjectQuestions = questions.filter(q =>
      q.subject === subject || q.category === subject
    );
    const shuffled = [...subjectQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    return {
      title: `Quick ${subject} Quiz`,
      subject,
      questions: shuffled,
      timeLimit: shuffled.length * 60,
      mode: 'timed'
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <WelcomeBanner
        title={`Welcome back, ${user?.displayName || user?.email?.split('@')[0] || 'Student'}! 👋`}
        subtitle={stats.totalTests > 0
          ? `You've completed ${stats.totalTests} tests with an average score of ${stats.avgScore}%. Keep going!`
          : 'Start your first quiz and begin your learning journey!'
        }
        gradient="from-blue-600 to-indigo-700"
      />

      {/* Streak & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-none">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🔥</div>
            <div>
              <p className="text-orange-100 text-sm">Current Streak</p>
              <p className="text-3xl font-bold">{stats.streakDays} days</p>
              <p className="text-orange-100 text-xs mt-1">
                {stats.streakDays > 0 ? 'Keep it up!' : 'Take a quiz to start your streak!'}
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Start */}
        <Card className="col-span-1 md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">⚡ Quick Start</h3>
          <div className="flex flex-wrap gap-2">
            {availableSubjects.slice(0, 6).map(subject => (
              <button
                key={subject}
                onClick={() => onStartTest(quickStartConfig(subject))}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                {subject}
              </button>
            ))}
            <button
              onClick={() => onNavigate('quiz-browser')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Browse All →
            </button>
          </div>
        </Card>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Tests Taken"
          value={stats.totalTests}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Average Score"
          value={`${stats.avgScore}%`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="emerald"
          trend={stats.avgScore >= 70 ? 'up' : stats.avgScore >= 50 ? 'neutral' : 'down'}
        />
        <StatCard
          title="Best Score"
          value={`${stats.bestScore}%`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title="Questions Solved"
          value={stats.totalQuestions}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple"
          subtitle={`${stats.totalCorrect} correct`}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Results */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">📝 Recent Results</h3>
            <button
              onClick={() => onNavigate('my-results')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>
          {recentResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📚</p>
              <p className="text-gray-500 dark:text-gray-400">No results yet</p>
              <button
                onClick={() => onNavigate('quiz-browser')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Take Your First Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result, idx) => (
                <div
                  key={result.id || idx}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
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
                        {result.correctAnswers || 0}/{result.totalQuestions || 0} correct •{' '}
                        {formatTimeAgo(result.completedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      (result.percentage || 0) >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      (result.percentage || 0) >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {(result.percentage || 0) >= 80 ? 'Excellent' :
                       (result.percentage || 0) >= 60 ? 'Good' :
                       (result.percentage || 0) >= 40 ? 'Average' : 'Needs Work'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Subject Performance */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📊 Subject Performance</h3>
          {subjectBreakdown.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subjectBreakdown.slice(0, 5).map((subject, idx) => (
                <div key={subject.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject.name}</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{subject.avgScore}%</span>
                  </div>
                  <ProgressBar
                    value={subject.avgScore}
                    max={100}
                    color={subject.avgScore >= 80 ? 'emerald' : subject.avgScore >= 60 ? 'yellow' : 'red'}
                    size="sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {subject.tests} test{subject.tests !== 1 ? 's' : ''} • {subject.correct}/{subject.total} correct
                  </p>
                </div>
              ))}
            </div>
          )}
          {subjectBreakdown.length > 5 && (
            <button
              onClick={() => onNavigate('analytics')}
              className="mt-4 w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All Subjects
            </button>
          )}
        </Card>
      </div>

      {/* Time Spent & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Time */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">⏱️ Study Time</h3>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {formatDuration(stats.totalTimeSpent)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total time spent on quizzes</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {stats.totalTests > 0
                  ? formatDuration(Math.round(stats.totalTimeSpent / stats.totalTests))
                  : '0m'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg per test</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {stats.totalQuestions > 0
                  ? `${Math.round(stats.totalTimeSpent / stats.totalQuestions)}s`
                  : '0s'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg per question</p>
            </div>
          </div>
        </Card>

        {/* Recommendations */}
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">💡 Recommendations</h3>
          <div className="space-y-3">
            {getRecommendations(stats, subjectBreakdown, results).map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-xl flex-shrink-0">{rec.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{rec.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper functions
const calculateStreak = (results) => {
  if (!results.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toDateString();
    const hasResult = results.some(r => {
      const resultDate = r.completedAt?.seconds
        ? new Date(r.completedAt.seconds * 1000)
        : r.completedAt instanceof Date ? r.completedAt : null;
      return resultDate && resultDate.toDateString() === dateStr;
    });

    if (hasResult) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    } else {
      break;
    }
  }
  return streak;
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Recently';
  const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const getRecommendations = (stats, subjects, results) => {
  const recs = [];

  if (stats.totalTests === 0) {
    recs.push({
      icon: '🚀',
      title: 'Take your first quiz!',
      description: 'Browse available quizzes and start your learning journey.'
    });
    return recs;
  }

  const weakSubjects = subjects.filter(s => s.avgScore < 60);
  if (weakSubjects.length > 0) {
    recs.push({
      icon: '📖',
      title: `Focus on ${weakSubjects[0].name}`,
      description: `Your average score is ${weakSubjects[0].avgScore}%. Practice more to improve.`
    });
  }

  if (stats.avgScore < 70) {
    recs.push({
      icon: '🎯',
      title: 'Try Practice Mode',
      description: 'Practice without time pressure to build confidence.'
    });
  }

  if (stats.streakDays >= 3) {
    recs.push({
      icon: '🔥',
      title: `Amazing ${stats.streakDays}-day streak!`,
      description: 'Consistency is key. Keep your streak going!'
    });
  }

  if (stats.totalTests >= 10 && stats.avgScore >= 80) {
    recs.push({
      icon: '🏆',
      title: 'Challenge yourself!',
      description: 'Try harder difficulty levels to push your limits.'
    });
  }

  if (recs.length === 0) {
    recs.push({
      icon: '✨',
      title: 'Keep going!',
      description: "You're making great progress. Try a new subject today."
    });
  }

  return recs.slice(0, 3);
};

export default StudentDashboard;
