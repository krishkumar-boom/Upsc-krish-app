// src/components/student/sections/StudyPlanner.jsx
import React, { useState, useMemo, useCallback } from 'react';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';

const StudyPlanner = ({ results, questions, user }) => {
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`studyGoals_${user?.uid}`) || '[]');
    } catch { return []; }
  });
  const [newGoal, setNewGoal] = useState({ subject: '', target: 80, testsPerWeek: 3, deadline: '' });
  const [showAddGoal, setShowAddGoal] = useState(false);

  const subjects = useMemo(() => {
    const subs = new Set();
    questions?.forEach(q => {
      if (q.subject) subs.add(q.subject);
      if (q.category) subs.add(q.category);
    });
    return Array.from(subs).sort();
  }, [questions]);

  const weeklyActivity = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return days.map((day, idx) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + idx);
      const dayResults = results.filter(r => {
        const rDate = r.completedAt?.seconds
          ? new Date(r.completedAt.seconds * 1000) : new Date(r.completedAt || 0);
        return rDate.toDateString() === date.toDateString();
      });
      return {
        day,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tests: dayResults.length,
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today
      };
    });
  }, [results]);

  const studySuggestions = useMemo(() => {
    const subjectScores = {};
    results.forEach(r => {
      const subject = r.subject || r.category || 'General';
      if (!subjectScores[subject]) subjectScores[subject] = [];
      subjectScores[subject].push(r.percentage || 0);
    });

    const suggestions = [];

    // Subjects needing attention (lowest avg scores)
    Object.entries(subjectScores)
      .map(([name, scores]) => ({
        name,
        avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
        lastAttempt: scores.length
      }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3)
      .forEach(s => {
        if (s.avg < 70) {
          suggestions.push({
            subject: s.name,
            type: 'improve',
            priority: s.avg < 50 ? 'high' : 'medium',
            message: `Score ${s.avg}% — needs more practice`
          });
        }
      });

    // Subjects not attempted
    subjects.forEach(s => {
      if (!subjectScores[s]) {
        suggestions.push({
          subject: s,
          type: 'new',
          priority: 'low',
          message: 'Not attempted yet — try this subject!'
        });
      }
    });

    return suggestions;
  }, [results, subjects]);

  const saveGoals = useCallback((updatedGoals) => {
    setGoals(updatedGoals);
    localStorage.setItem(`studyGoals_${user?.uid}`, JSON.stringify(updatedGoals));
  }, [user]);

  const handleAddGoal = () => {
    if (!newGoal.subject) return;
    const goal = {
      id: Date.now(),
      ...newGoal,
      createdAt: new Date().toISOString()
    };
    saveGoals([...goals, goal]);
    setNewGoal({ subject: '', target: 80, testsPerWeek: 3, deadline: '' });
    setShowAddGoal(false);
  };

  const handleRemoveGoal = (goalId) => {
    saveGoals(goals.filter(g => g.id !== goalId));
  };

  const getGoalProgress = (goal) => {
    const subjectResults = results.filter(r =>
      r.subject === goal.subject || r.category === goal.subject
    );
    if (subjectResults.length === 0) return 0;
    const avgScore = Math.round(
      subjectResults.reduce((s, r) => s + (r.percentage || 0), 0) / subjectResults.length
    );
    return Math.min(100, Math.round((avgScore / goal.target) * 100));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Weekly Activity */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📅 This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {weeklyActivity.map((day, idx) => (
            <div
              key={idx}
              className={`text-center p-3 rounded-lg transition-colors ${
                day.isToday
                  ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                  : day.tests > 0
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : day.isPast
                  ? 'bg-gray-50 dark:bg-gray-700/30'
                  : 'bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{day.day}</p>
              <p className={`text-lg font-bold mt-1 ${
                day.tests > 0 ? 'text-emerald-600' : 'text-gray-300 dark:text-gray-600'
              }`}>
                {day.tests > 0 ? day.tests : '—'}
              </p>
              <p className="text-[10px] text-gray-400">{day.date}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          {weeklyActivity.filter(d => d.tests > 0).length}/7 active days this week
        </p>
      </Card>

      {/* Study Goals */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-white">🎯 Study Goals</h3>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddGoal && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={newGoal.subject}
                onChange={(e) => setNewGoal({ ...newGoal, subject: e.target.value })}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Target:</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddGoal}
                disabled={!newGoal.subject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Save Goal
              </button>
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goal Cards */}
        {goals.length === 0 ? (
          <p className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
            No goals set. Add a goal to track your progress!
          </p>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => {
              const progress = getGoalProgress(goal);
              return (
                <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{goal.subject}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Target: {goal.target}%
                        {goal.deadline && ` • Due: ${new Date(goal.deadline).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <ProgressBar
                    value={progress}
                    max={100}
                    color={progress >= 100 ? 'emerald' : progress >= 60 ? 'blue' : 'yellow'}
                    size="md"
                    showLabel
                  />
                  {progress >= 100 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✅ Goal achieved!</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Study Suggestions */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">💡 Suggested Study Plan</h3>
        {studySuggestions.length === 0 ? (
          <p className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
            Complete some quizzes to get personalized suggestions!
          </p>
        ) : (
          <div className="space-y-3">
            {studySuggestions.map((suggestion, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${
                suggestion.priority === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : suggestion.priority === 'medium'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {suggestion.type === 'improve' ? '📖' : '🆕'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{suggestion.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{suggestion.message}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  suggestion.priority === 'high'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    : suggestion.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                }`}>
                  {suggestion.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudyPlanner;
