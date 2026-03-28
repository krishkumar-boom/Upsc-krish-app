// src/components/student/sections/QuizBrowser.jsx
import React, { useState, useMemo } from 'react';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import EmptyState from '../../common/EmptyState';

const QuizBrowser = ({ questions, results, onStartTest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [sortBy, setSortBy] = useState('name');

  const subjects = useMemo(() => {
    if (!questions) return [];
    const subjectMap = {};
    questions.forEach(q => {
      const subject = q.subject || q.category || 'General';
      if (!subjectMap[subject]) {
        subjectMap[subject] = { name: subject, count: 0, difficulties: new Set() };
      }
      subjectMap[subject].count++;
      if (q.difficulty) subjectMap[subject].difficulties.add(q.difficulty);
    });
    return Object.values(subjectMap).map(s => ({
      ...s,
      difficulties: Array.from(s.difficulties)
    }));
  }, [questions]);

  const filteredSubjects = useMemo(() => {
    let filtered = subjects;
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'count') {
      filtered.sort((a, b) => b.count - a.count);
    }
    return filtered;
  }, [subjects, searchQuery, sortBy]);

  const getSubjectStats = (subjectName) => {
    const subjectResults = results.filter(r =>
      r.subject === subjectName || r.category === subjectName
    );
    if (subjectResults.length === 0) return null;
    const avgScore = Math.round(
      subjectResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / subjectResults.length
    );
    return { attempts: subjectResults.length, avgScore };
  };

  const handleStartQuiz = (subject) => {
    let available = questions.filter(q =>
      (q.subject === subject.name || q.category === subject.name)
    );

    if (selectedDifficulty !== 'all') {
      available = available.filter(q => q.difficulty === selectedDifficulty);
    }

    if (available.length === 0) {
      alert('No questions available with the selected filters.');
      return;
    }

    const count = Math.min(questionCount, available.length);
    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, count);

    onStartTest({
      title: `${subject.name} Quiz`,
      subject: subject.name,
      questions: shuffled,
      timeLimit: count * timePerQuestion,
      mode: 'timed',
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : 'mixed'
    });
  };

  const handleCustomQuiz = () => {
    let available = [...questions];

    if (selectedSubject !== 'all') {
      available = available.filter(q =>
        q.subject === selectedSubject || q.category === selectedSubject
      );
    }

    if (selectedDifficulty !== 'all') {
      available = available.filter(q => q.difficulty === selectedDifficulty);
    }

    if (available.length === 0) {
      alert('No questions match your criteria.');
      return;
    }

    const count = Math.min(questionCount, available.length);
    const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, count);

    onStartTest({
      title: 'Custom Quiz',
      subject: selectedSubject !== 'all' ? selectedSubject : 'Mixed',
      questions: shuffled,
      timeLimit: count * timePerQuestion,
      mode: 'timed',
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : 'mixed'
    });
  };

  if (!questions || questions.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="No Quizzes Available"
        description="There are no questions in the database yet. Check back later!"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Custom Quiz Builder */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">🎯 Build Your Quiz</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.name} value={s.name}>{s.name} ({s.count})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Questions</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[5, 10, 15, 20, 25, 30, 50].map(n => (
                <option key={n} value={n}>{n} questions</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time/Question</label>
            <select
              value={timePerQuestion}
              onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={30}>30 sec</option>
              <option value={45}>45 sec</option>
              <option value={60}>1 min</option>
              <option value={90}>1.5 min</option>
              <option value={120}>2 min</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCustomQuiz}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Start Quiz →
            </button>
          </div>
        </div>
      </Card>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white"
        >
          <option value="name">Sort by Name</option>
          <option value="count">Sort by Questions</option>
        </select>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((subject) => {
          const subjectStats = getSubjectStats(subject.name);
          const colorIdx = subject.name.charCodeAt(0) % 6;
          const colors = [
            'from-blue-500 to-blue-600',
            'from-emerald-500 to-emerald-600',
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-teal-500 to-teal-600'
          ];

          return (
            <Card key={subject.name} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                  {subject.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1">
                  {subject.difficulties.map(d => (
                    <Badge key={d} color={d === 'easy' ? 'green' : d === 'medium' ? 'yellow' : 'red'} size="xs">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{subject.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {subject.count} question{subject.count !== 1 ? 's' : ''} available
              </p>

              {subjectStats && (
                <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Attempts</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{subjectStats.attempts}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-600" />
                  <div className="text-center flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
                    <p className={`text-sm font-bold ${subjectStats.avgScore >= 70 ? 'text-emerald-600' : subjectStats.avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {subjectStats.avgScore}%
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleStartQuiz(subject)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all group-hover:shadow-md"
              >
                Start Quiz ({Math.min(questionCount, subject.count)} Q)
              </button>
            </Card>
          );
        })}
      </div>

      {filteredSubjects.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No Subjects Found"
          description="Try adjusting your search query."
        />
      )}
    </div>
  );
};

export default QuizBrowser;
      
