// src/components/student/sections/Bookmarks.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Card from '../../common/Card';
import Badge from '../../common/Badge';
import EmptyState from '../../common/EmptyState';

const Bookmarks = ({ questions, user, onStartTest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [localBookmarks, setLocalBookmarks] = useState(user?.bookmarks || []);

  const bookmarkedQuestions = useMemo(() => {
    if (!questions) return [];
    let bookmarked = questions.filter(q => localBookmarks.includes(q.id));

    if (searchQuery) {
      bookmarked = bookmarked.filter(q =>
        q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterSubject !== 'all') {
      bookmarked = bookmarked.filter(q =>
        q.subject === filterSubject || q.category === filterSubject
      );
    }

    return bookmarked;
  }, [questions, localBookmarks, searchQuery, filterSubject]);

  const subjects = useMemo(() => {
    const subs = new Set();
    questions?.forEach(q => {
      if (localBookmarks.includes(q.id)) {
        if (q.subject) subs.add(q.subject);
        if (q.category) subs.add(q.category);
      }
    });
    return Array.from(subs).sort();
  }, [questions, localBookmarks]);

  const handleRemoveBookmark = useCallback(async (questionId) => {
    setLocalBookmarks(prev => prev.filter(id => id !== questionId));
    try {
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          bookmarks: arrayRemove(questionId)
        });
      }
    } catch (err) {
      console.error('Error removing bookmark:', err);
      setLocalBookmarks(prev => [...prev, questionId]);
    }
  }, [user]);

  const handleQuizFromBookmarks = () => {
    if (bookmarkedQuestions.length === 0) return;
    const shuffled = [...bookmarkedQuestions].sort(() => Math.random() - 0.5);
    onStartTest({
      title: 'Bookmarked Questions Quiz',
      subject: 'Bookmarks',
      questions: shuffled,
      timeLimit: shuffled.length * 60,
      mode: 'timed'
    });
  };

  if (localBookmarks.length === 0) {
    return (
      <EmptyState
        icon="🔖"
        title="No Bookmarks"
        description="Bookmark questions during quizzes to review them later!"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {bookmarkedQuestions.length} bookmarked question{bookmarkedQuestions.length !== 1 ? 's' : ''}
          </p>
        </div>
        {bookmarkedQuestions.length > 0 && (
          <button
            onClick={handleQuizFromBookmarks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Quiz from Bookmarks ({bookmarkedQuestions.length} Q)
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          />
        </div>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Bookmarked Questions */}
      <div className="space-y-3">
        {bookmarkedQuestions.map((q, idx) => (
          <Card key={q.id || idx} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {q.subject && <Badge color="blue" size="xs">{q.subject}</Badge>}
                  {q.difficulty && (
                    <Badge
                      color={q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'yellow' : 'red'}
                      size="xs"
                    >
                      {q.difficulty}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                  {q.question}
                </p>
                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`text-xs px-3 py-1.5 rounded-md ${
                          opt === q.correctAnswer || optIdx === q.correctIndex
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                )}
                {q.explanation && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleRemoveBookmark(q.id)}
                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove bookmark"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {bookmarkedQuestions.length === 0 && localBookmarks.length > 0 && (
        <EmptyState
          icon="🔍"
          title="No Matches"
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
};

export default Bookmarks;
