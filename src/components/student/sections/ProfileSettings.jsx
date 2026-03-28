// src/components/student/sections/ProfileSettings.jsx
import React, { useState, useCallback } from 'react';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/config';
import Card from '../../common/Card';

const ProfileSettings = ({ user }) => {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'medium');

  const handleUpdateProfile = useCallback(async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          displayName: displayName.trim(),
          updatedAt: new Date()
        });
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }, [displayName, user]);

  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.code === 'auth/wrong-password' ? 'Current password is incorrect.' : err.message });
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, user]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    document.documentElement.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Info */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">👤 Profile Information</h3>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {displayName || 'Student'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Member since {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={saving || !displayName.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">🔒 Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">⚙️ Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
            <div className="flex gap-3">
              {['light', 'dark', 'system'].map(t => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
            <div className="flex gap-3">
              {['small', 'medium', 'large'].map(s => (
                <button
                  key={s}
                  onClick={() => handleFontSizeChange(s)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    fontSize === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{ fontSize: s === 'small' ? '12px' : s === 'large' ? '16px' : '14px' }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Account Info */}
      <Card>
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📋 Account Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">User ID</span>
            <span className="text-gray-800 dark:text-white font-mono text-xs">{user?.uid}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Email Verified</span>
            <span className={user?.emailVerified ? 'text-emerald-600' : 'text-yellow-600'}>
              {user?.emailVerified ? '✅ Yes' : '⚠️ No'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Last Sign In</span>
            <span className="text-gray-800 dark:text-white">
              {user?.metadata?.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleString()
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500 dark:text-gray-400">Provider</span>
            <span className="text-gray-800 dark:text-white">
              {user?.providerData?.[0]?.providerId === 'password' ? '📧 Email' : '🔗 ' + (user?.providerData?.[0]?.providerId || 'Unknown')}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileSettings;
