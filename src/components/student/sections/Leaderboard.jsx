// src/components/student/sections/Leaderboard.jsx
import React, { useState, useMemo } from 'react';
import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';

const Leaderboard = ({ results, currentUser }) => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [metric, setMetric] = useState('avgScore');

  const leaderboardData = useMemo(() => {
    if (!results || results.length === 0) return [];

    let filtered = [...results];

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      switch (timeFilter) {
        case 'today': cutoff.setHours(0, 0, 0, 0); break;
        case 'week': cutoff.setDate(now.getDate() - 7); break;
        case 'month': cutoff.setMonth(now.getMonth() - 1); break;
        default: break;
      }
      filtered = filtered.filter(r => {
        const date = r.completedAt?.seconds
          ? new Date(r.completedAt.seconds * 1000) : new Date(r.completedAt || 0);
        return date >= cutoff;
      });
    }

    // Aggregate by user
    const userStats = {};
    filtered.forEach(r => {
      const uid = r.userId;
      if (!uid) return;
      if (!userStats[uid]) {
        userStats[uid] = {
          userId: uid,
          displayName: r.userName || r.userDisplayName || r.userEmail?.split('@')[0] || 'Anonymous',
          email: r.userEmail || '',
          tests: 0,
          totalScore: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          bestScore: 0,
          totalTime: 0
        };
      }
      userStats[uid].tests++;
      userStats[uid].totalScore += r.percentage || 0;
      userStats[uid].totalCorrect += r.correctAnswers || 0;
      userStats[uid].totalQuestions += r.totalQuestions || 0;
      userStats[uid].bestScore = Math.max(userStats[uid].bestScore, r.percentage || 0);
      userStats[uid].totalTime += r.timeTaken || 0;
    });

    return Object.values(userStats)
      .map(u => ({
        ...u,
        avgScore: Math.round(u.totalScore / u.tests),
        accuracy: u.totalQuestions > 0 ? Math.round((u.totalCorrect / u.totalQuestions) * 100) : 0
      }))
      .sort((a, b) => {
        switch (metric) {
          case 'avgScore': return b.avgScore - a.avgScore;
          case 'tests': return b.tests - a.tests;
          case 'accuracy': return b.accuracy - a.accuracy;
          case 'bestScore': return b.bestScore - a.bestScore;
          default: return b.avgScore - a.avgScore;
        }
      });
  }, [results, timeFilter, metric]);

  const myRank = useMemo(() => {
    if (!currentUser) return null;
    const idx = leaderboardData.findIndex(u => u.userId === currentUser.uid);
    return idx >= 0 ? idx + 1 : null;
  }, [leaderboardData, currentUser]);

  const medalEmojis = ['🥇', '🥈', '🥉'];
  const podiumColors = [
    'from-yellow-400 to-yellow-600',
    'from-gray-300 to-gray-500',
    'from-orange-400 to-orange-600'
  ];

  if (!results || results.length === 0) {
    return (
      <EmptyState
        icon="🏆"
        title="No Leaderboard Data"
        description="Complete quizzes to appear on the leaderboard!"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* My Rank */}
      {myRank && (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                #{myRank}
              </div>
              <div>
                <p className="font-bold text-lg">Your Rank</p>
                <p className="text-blue-200 text-sm">
                  out of {leaderboardData.length} participant{leaderboardData.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {myRank <= 3 && <span className="text-4xl">{medalEmojis[myRank - 1]}</span>}
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {['all', 'today', 'week', 'month'].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeFilter === filter
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        >
          <option value="avgScore">Avg Score</option>
          <option value="accuracy">Accuracy</option>
          <option value="tests">Tests Completed</option>
          <option value="bestScore">Best Score</option>
        </select>
      </div>

      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-4">
          {[1, 0, 2].map(pos => {
            const user = leaderboardData[pos];
            if (!user) return null;
            return (
              <div key={pos} className="text-center">
                <div className={`${pos === 0 ? 'mb-4' : 'mb-2'}`}>
                  <span className="text-3xl">{medalEmojis[pos]}</span>
                </div>
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${podiumColors[pos]} flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                  user.userId === currentUser?.uid ? 'ring-4 ring-blue-400' : ''
                }`}>
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-white mt-2 max-w-[100px] truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {metric === 'tests' ? `${user.tests} tests` : `${user[metric] || user.avgScore}%`}
                </p>
                <div className={`mx-auto mt-2 rounded-t-lg bg-gradient-to-b ${podiumColors[pos]} ${
                  pos === 0 ? 'w-20 h-24' : pos === 1 ? 'w-20 h-16' : 'w-20 h-12'
                } flex items-center justify-center text-white font-bold text-xl`}>
                  {pos + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Rank</th>
                <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Student</th>
                <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Tests</th>
                <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Avg Score</th>
                <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Accuracy</th>
                <th className="text-center py-3 px-3 text-gray-600 dark:text-gray-400 font-medium">Best</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((user, idx) => (
                <tr
                  key={user.userId}
                  className={`border-b border-gray-100 dark:border-gray-700/50 transition-colors ${
                    user.userId === currentUser?.uid
                      ? 'bg-blue-50 dark:bg-blue-900/20 font-medium'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1">
                      {idx < 3 ? (
                        <span className="text-lg">{medalEmojis[idx]}</span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 font-medium w-6 text-center">
                          {idx + 1}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-800 dark:text-white">
                          {user.displayName}
                          {user.userId === currentUser?.uid && (
                            <span className="text-blue-600 dark:text-blue-400 text-xs ml-1">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">{user.tests}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`font-bold ${
                      user.avgScore >= 80 ? 'text-emerald-600' :
                      user.avgScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {user.avgScore}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">{user.accuracy}%</td>
                  <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">{Math.round(user.bestScore)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {leaderboardData.length === 0 && (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">No data for selected period</p>
        )}
      </Card>
    </div>
  );
};

export default Leaderboard;
