// src/components/student/sections/Achievements.jsx
import React, { useMemo } from 'react';
import Card from '../../common/Card';
import ProgressBar from '../../common/ProgressBar';

const ACHIEVEMENTS = [
  { id: 'first_quiz', title: 'First Steps', description: 'Complete your first quiz', icon: '🎯', requirement: (r) => r.length >= 1 },
  { id: 'five_quizzes', title: 'Getting Started', description: 'Complete 5 quizzes', icon: '📝', requirement: (r) => r.length >= 5, target: 5 },
  { id: 'ten_quizzes', title: 'Committed Learner', description: 'Complete 10 quizzes', icon: '📚', requirement: (r) => r.length >= 10, target: 10 },
  { id: 'twenty_five', title: 'Dedicated', description: 'Complete 25 quizzes', icon: '💪', requirement: (r) => r.length >= 25, target: 25 },
  { id: 'fifty_quizzes', title: 'Quiz Master', description: 'Complete 50 quizzes', icon: '🏆', requirement: (r) => r.length >= 50, target: 50 },
  { id: 'hundred', title: 'Century', description: 'Complete 100 quizzes', icon: '💯', requirement: (r) => r.length >= 100, target: 100 },
  { id: 'perfect_score', title: 'Perfect!', description: 'Score 100% on a quiz', icon: '⭐', requirement: (r) => r.some(x => (x.percentage || 0) >= 100) },
  { id: 'high_scorer', title: 'High Scorer', description: 'Score above 90% five times', icon: '🌟', requirement: (r) => r.filter(x => (x.percentage || 0) >= 90).length >= 5, target: 5 },
  { id: 'consistent', title: 'Consistent', description: 'Average above 80%', icon: '🎯', requirement: (r) => r.length >= 5 && (r.reduce((s, x) => s + (x.percentage || 0), 0) / r.length) >= 80 },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Complete a 10-question quiz in under 3 minutes', icon: '⚡', requirement: (r) => r.some(x => (x.totalQuestions || 0) >= 10 && (x.timeTaken || Infinity) < 180) },
  { id: 'streak_3', title: 'On Fire', description: '3-day streak', icon: '🔥', requirement: (r, streak) => streak >= 3 },
  { id: 'streak_7', title: 'Unstoppable', description: '7-day streak', icon: '🔥', requirement: (r, streak) => streak >= 7 },
  { id: 'streak_30', title: 'Iron Will', description: '30-day streak', icon: '💎', requirement: (r, streak) => streak >= 30 },
  { id: 'multi_subject', title: 'Versatile', description: 'Quiz in 5 different subjects', icon: '🌈', requirement: (r) => new Set(r.map(x => x.subject || x.category)).size >= 5 },
  { id: 'night_owl', title: 'Night Owl', description: 'Complete a quiz after 10 PM', icon: '🦉', requirement: (r) => r.some(x => { const d = x.completedAt?.seconds ? new Date(x.completedAt.seconds * 1000) : null; return d && d.getHours() >= 22; }) },
  { id: 'early_bird', title: 'Early Bird', description: 'Complete a quiz before 7 AM', icon: '🌅', requirement: (r) => r.some(x => { const d = x.completedAt?.seconds ? new Date(x.completedAt.seconds * 1000) : null; return d && d.getHours() < 7; }) },
];

const Achievements = ({ results, user }) => {
  const streak = useMemo(() => {
    if (!results.length) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let s = 0;
    let check = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = check.toDateString();
      const has = results.some(r => {
        const d = r.completedAt?.seconds ? new Date(r.completedAt.seconds * 1000) : null;
        return d && d.toDateString() === dateStr;
      });
      if (has) { s++; check.setDate(check.getDate() - 1); }
      else if (i === 0) { check.setDate(check.getDate() - 1); }
      else break;
    }
    return s;
  }, [results]);

  const achievementStatus = useMemo(() => {
    return ACHIEVEMENTS.map(a => {
      const unlocked = a.requirement(results, streak);
      let progress = 0;

      if (unlocked) {
        progress = 100;
      } else if (a.target) {
        progress = Math.min(99, Math.round((results.length / a.target) * 100));
      }

      return { ...a, unlocked, progress };
    });
  }, [results, streak]);

  const unlockedCount = achievementStatus.filter(a => a.unlocked).length;
  const totalCount = achievementStatus.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold">🏆 Achievements</h3>
            <p className="text-purple-200">
              {unlockedCount} of {totalCount} unlocked ({completionPercent}%)
            </p>
          </div>
          <div className="text-5xl font-bold text-white/20">{unlockedCount}</div>
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </Card>

      {/* Unlocked Achievements */}
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
          ✅ Unlocked ({achievementStatus.filter(a => a.unlocked).length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievementStatus.filter(a => a.unlocked).map(achievement => (
            <Card key={achievement.id} className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{achievement.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{achievement.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {achievementStatus.filter(a => a.unlocked).length === 0 && (
          <Card className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">
              Complete quizzes to unlock your first achievement!
            </p>
          </Card>
        )}
      </div>

      {/* Locked Achievements */}
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
          🔒 Locked ({achievementStatus.filter(a => !a.unlocked).length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievementStatus.filter(a => !a.unlocked).map(achievement => (
            <Card key={achievement.id} className="opacity-60 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl grayscale">{achievement.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{achievement.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                </div>
              </div>
              {achievement.target && (
                <ProgressBar
                  value={achievement.progress}
                  max={100}
                  color="gray"
                  size="sm"
                  showLabel
                />
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
