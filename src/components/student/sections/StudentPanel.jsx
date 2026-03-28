// src/components/student/StudentPanel.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Sidebar from '../common/Sidebar';
import StudentDashboard from './sections/StudentDashboard';
import AvailableTests from './sections/AvailableTests';
import CustomTestBuilder from './sections/CustomTestBuilder';
import DailyQuiz from './sections/DailyQuiz';
import Challenges from './sections/Challenges';
import SmartPractice from './sections/SmartPractice';
import PerformanceAnalytics from './sections/PerformanceAnalytics';
import TestHistory from './sections/TestHistory';
import Achievements from './sections/Achievements';
import Bookmarks from './sections/Bookmarks';
import NotificationCenter from './sections/NotificationCenter';
import ProfileSettings from './sections/ProfileSettings';
import QuizBrowser from './sections/QuizBrowser';
import PracticeMode from './sections/PracticeMode';
import MyResults from './sections/MyResults';
import Leaderboard from './sections/Leaderboard';
import StudyPlanner from './sections/StudyPlanner';
import TestEngine from '../test/TestEngine';

const StudentPanel = () => {
  const { currentUser: user, logout } = useAuth();
  const { questions, getUserResults, getAnnouncements } = useData();
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeTest, setActiveTest] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserResults(user.uid).then(setResults).catch(() => setResults([]));
    getAnnouncements(true).then(setNotifications).catch(() => setNotifications([]));
  }, [user, getUserResults, getAnnouncements]);

  const unreadNotifications = useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter(n => !n.readBy?.includes(user?.uid)).length;
  }, [notifications, user]);

  const myResults = useMemo(() => {
    if (!results || !user) return [];
    return results
      .filter(r => r.userId === user.uid)
      .sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
  }, [results, user]);

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      id: 'quiz-browser',
      label: 'Browse Quizzes',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'practice',
      label: 'Practice Mode',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'my-results',
      label: 'My Results',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'test-history',
      label: 'Test History',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Performance',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    },
    {
      id: 'study-planner',
      label: 'Study Planner',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: unreadNotifications
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const handleStartTest = useCallback((testConfig) => {
    setActiveTest(testConfig);
  }, []);

  const handleEndTest = useCallback(() => {
    setActiveTest(null);
    setActiveSection('my-results');
  }, []);

  const handleNavigate = useCallback((section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  }, []);

  // If test is active, render TestEngine full screen
  if (activeTest) {
    return (
      <TestEngine
        testConfig={activeTest}
        onSubmit={(result) => {
          handleEndTest();
        }}
        onClose={() => setActiveTest(null)}
      />
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <StudentDashboard
            user={user}
            results={myResults}
            questions={questions}
            onNavigate={handleNavigate}
            onStartTest={handleStartTest}
          />
        );
      case 'availableTests':
        return (
          <AvailableTests
            questions={questions}
            results={myResults}
            onStartTest={handleStartTest}
          />
        );
      case 'customTest':
        return (
          <CustomTestBuilder
            questions={questions}
            onStartTest={handleStartTest}
          />
        );
      case 'dailyQuiz':
        return (
          <DailyQuiz
            onStartTest={handleStartTest}
          />
        );
      case 'challenges':
        return (
          <Challenges
            questions={questions}
            onStartTest={handleStartTest}
          />
        );
      case 'smartPractice':
        return (
          <SmartPractice
            questions={questions}
            results={myResults}
            onStartTest={handleStartTest}
          />
        );
      case 'profileAnalysis':
      case 'performance':
        return (
          <PerformanceAnalytics
            results={myResults}
            questions={questions}
          />
        );
      case 'testHistory':
        return (
          <TestHistory
            results={myResults}
            questions={questions}
          />
        );
      case 'achievements':
        return (
          <Achievements
            results={myResults}
            user={user}
          />
        );
      case 'bookmarks':
        return (
          <Bookmarks
            questions={questions}
            user={user}
            onStartTest={handleStartTest}
          />
        );
      case 'announcements':
      case 'notifications':
        return (
          <NotificationCenter
            notifications={notifications}
            user={user}
          />
        );
      case 'settings':
      case 'profile':
        return (
          <ProfileSettings
            user={user}
          />
        );
      case 'quiz-browser':
        return <QuizBrowser questions={questions} onStartTest={handleStartTest} />;
      case 'practice':
        return <PracticeMode questions={questions} results={myResults} onStartTest={handleStartTest} />;
      case 'my-results':
        return <MyResults results={myResults} questions={questions} />;
      case 'leaderboard':
        return <Leaderboard results={myResults} user={user} />;
      case 'study-planner':
        return <StudyPlanner results={myResults} questions={questions} />;
      default:
        return (
          <StudentDashboard
            user={user}
            results={myResults}
            questions={questions}
            onNavigate={handleNavigate}
            onStartTest={handleStartTest}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleNavigate}
        type="student"
      />

      {/* Main Content - offset for fixed sidebar */}
      <main className="md:ml-[280px] w-full md:w-[calc(100%-280px)] p-4 md:p-6 min-h-screen pb-20 md:pb-8">
        {renderSection()}
        <div className="text-center py-6 text-gray-400 text-xs font-medium tracking-wider">
          Developer: KRISH MADDHESHIYA
        </div>
      </main>
    </div>
  );
};

const getSubtitle = (section) => {
  const subtitles = {
    'dashboard': 'Overview of your learning progress',
    'quiz-browser': 'Find and start new quizzes',
    'practice': 'Practice without time pressure',
    'my-results': 'Review your test results',
    'test-history': 'Complete history of all tests',
    'analytics': 'Detailed performance insights',
    'leaderboard': 'See how you compare',
    'bookmarks': 'Your saved questions',
    'study-planner': 'Plan your study schedule',
    'achievements': 'Badges and milestones',
    'notifications': 'Updates and announcements',
    'profile': 'Manage your account'
  };
  return subtitles[section] || '';
};

export default StudentPanel;
