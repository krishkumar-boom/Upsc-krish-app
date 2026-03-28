// src/components/student/sections/PracticeMode.jsx
import React, { useState, useMemo, useCallback } from 'react';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import EmptyState from '../../common/EmptyState';

const PracticeMode = ({ questions, results, onStartTest }) => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [practiceType, setPracticeType] = useState('random');
  const [questionCount, setQuestionCount] = useState(10);

  const subjects = useMemo(() => {
    const subs = new Set();
    questions?.forEach(q => {
      if (q.subject) subs.add(q.subject);
      if (q.category) subs.add(q.category);
    });
    return Array.from(subs).sort();
  }, [questions]);

  const weakTopics = useMemo(() => {
    const topicScores = {};
    results.forEach(r => {
      const topic = r.subject || r.category || 'General';
      if (!topicScores[topic]) topicScores[topic] = { total: 0, correct: 0 };
      topicScores[topic].total += r.totalQuestions || 0;
      topicScores[topic].correct += r.correctAnswers || 0;
    });
    return Object.entries(topicScores)
      .map(([topic, data]) => ({
        topic,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        totalAttempted: data.total
      }))
      .filter(t => t.accuracy < 70 && t.totalAttempted >= 5)
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [results]);

  const getWronglyAnswered = useCallback(() => {
    const wrongIds = new Set();
    results.forEach(r => {
      r.answers?.forEach(a => {
        if (!a.isCorrect && a.questionId) wrongIds.add(a.questionId);
      });
    });
    return questions.filter(q => wrongIds.has(q.id));
  }, [results, questions]);

  const handleStartPractice = (type) => {
    let practiceQuestions = [];
    let title = 'Practice Session';

    switch (type || practiceType) {
      case 'random': {
        let pool = [...questions];
        if (selectedSubject !== 'all') {
          pool = pool.filter(q => q.subject === selectedSubject || q.category === selectedSubject);
        }
        if (selectedDifficulty !== 'all') {
          pool = pool.filter(q => q.difficulty === selectedDifficulty);
        }
        practiceQuestions = pool.sort(() => Math.random() - 0.5).slice(0, questionCount);
        title = 'Random Practice';
        break;
      }
      case 'weak': {
        if (weakTopics.length === 0) {
          alert('No weak topics found. Complete more quizzes first!');
          return;
        }
        const weakSubjects = weakTopics.map(t => t.topic);
        practiceQuestions = questions
          .filter(q => weakSubjects.includes(q.subject) || weakSubjects.includes(q.category))
          .sort(() => Math.random() - 0.5)
          .slice(0, questionCount);
        title = 'Weak Areas Practice';
        break;
      }
      case 'mistakes': {
        practiceQuestions = getWronglyAnswered()
          .sort(() => Math.random() - 0.5)
          .slice(0, questionCount);
        if (practiceQuestions.length === 0) {
          alert('No previously wrong answers found!');
          return;
        }
        title = 'Review Mistakes';
        break;
      }
      case 'hard': {
        practiceQuestions = questions
          .filter(q => q.difficulty === 'hard')
          .sort(() => Math.random() - 0.5)
          .slice(0, questionCount);
        title = 'Hard Questions Challenge';
        break;
      }
      default:
        break;
    }

    if (practiceQuestions.length === 0) {
      alert('No questions match your criteria.');
      return;
    }

    onStartTest({
      title,
      subject: selectedSubject !== 'all' ? selectedSubject : 'Mixed',
      questions: practiceQuestions,
      timeLimit: 0, // No time limit in practice mode
      mode: 'practice',
      showAnswerImmediately: true
    });
  };

  const practiceTypes = [
    {
      id: 'random',
      title: 'Random Practice',
      description: 'Random selection from your chosen subject and difficulty',
      icon: '🎲',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'weak',
      title: 'Weak Areas',
      description: `Focus on ${weakTopics.length} topic${weakTopics.length !== 1 ? 's' : ''} where you score below 70%`,
      icon: '🎯',
      color: 'from-orange-500 to-red-500',
      disabled: weakTopics.length === 0
    },
    {
      id: 'mistakes',
      title: 'Review Mistakes',
      description: `Practice ${getWronglyAnswered().length} questions you got wrong before`,
      icon: '🔄',
      color: 'from-purple-500 to-pink-500',
      disabled: getWronglyAnswered().length === 0
    },
    {
      id: 'hard',
      title: 'Hard Mode',
      description: `${questions.filter(q => q.difficulty === 'hard').length} challenging questions`,
      icon: '💪',
      color: 'from-red-500 to-red-600',
      disabled: questions.filter(q => q.difficulty === 'hard').length === 0
    }
  ];

  if (!questions || questions.length === 0) {
    return (
      <EmptyState
        icon="📚"
        title="No Questions Available"
        description="Questions need to be added before you can practice."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Practice Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {practiceTypes.map(type => (
          <button
            key={type.id}
            onClick={() => {
              setPracticeType(type.id);
              if (!type.disabled) handleStartPractice(type.id);
            }}
            disabled={type.disabled}
            className={`p-4 rounded-xl text-left transition-all ${
              type.disabled
                ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                : 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            } ${practiceType === type.id ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl mb-3 shadow-lg`}>
              {type.icon}
            </div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-1">{type.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
          </button>
        ))}
      </div>

      {/* Custom Practice Settings */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">⚙️ Custom Practice</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white"
            >
              <option value="all">All</option>
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
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white"
            >
              {[5, 10, 15, 20, 25, 30].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => handleStartPractice('random')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          ▶️ Start Custom Practice
        </button>
      </Card>

      {/* Weak Topics Detail */}
      {weakTopics.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📉 Areas to Improve</h3>
          <div className="space-y-3">
            {weakTopics.map((topic, idx) => (
              <div key={topic.topic} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{idx === 0 ? '🔴' : idx === 1 ? '🟠' : '🟡'}</span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">{topic.topic}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{topic.totalAttempted} questions attempted</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color="red">{topic.accuracy}% accuracy</Badge>
                  <button
                    onClick={() => {
                      const topicQ = questions.filter(q =>
                        q.subject === topic.topic || q.category === topic.topic
                      ).sort(() => Math.random() - 0.5).slice(0, questionCount);
                      if (topicQ.length > 0) {
                        onStartTest({
                          title: `Practice: ${topic.topic}`,
                          subject: topic.topic,
                          questions: topicQ,
                          timeLimit: 0,
                          mode: 'practice'
                        });
                      }
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Practice Tips */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">💡 Practice Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🧠', title: 'Active Recall', desc: 'Try to answer before looking at options' },
            { icon: '📝', title: 'Review Mistakes', desc: 'Learn from wrong answers to avoid repeating them' },
            { icon: '🔄', title: 'Spaced Repetition', desc: 'Come back to weak topics after a few days' }
          ].map((tip, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{tip.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PracticeMode;
