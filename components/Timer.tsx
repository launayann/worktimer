'use client';

import { useState, useEffect, useRef } from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { useSessions } from '@/lib/hooks/useSessions';
import type { Session } from '@/types/database';

type TimerState = 'idle' | 'running' | 'paused';

export default function Timer() {
  const { categories } = useCategories();
  const { createSession, endSession, updateSession, fetchActiveSession } = useSessions();

  const [state, setState] = useState<TimerState>('idle');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0); // en secondes
  const [pausedTime, setPausedTime] = useState(0); // total temps de pause en secondes
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<{
    twoHours: boolean;
    fourHours: boolean;
  }>({ twoHours: false, fourHours: false });

  // Load active session on mount
  useEffect(() => {
    const loadActiveSession = async () => {
      const activeSession = await fetchActiveSession();
      if (activeSession) {
        setCurrentSession(activeSession);
        setSelectedCategoryId(activeSession.category_id);
        setSessionStartTime(new Date(activeSession.start_time));
        setPausedTime(activeSession.pause_duration || 0);

        // Calculate elapsed time
        const now = new Date();
        const start = new Date(activeSession.start_time);
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000) - (activeSession.pause_duration || 0);
        setElapsedTime(elapsed);
        setState('running');
      }
    };
    loadActiveSession();
  }, []);

  // Timer interval
  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1;

          // Check for 2 hour notification (7200 seconds)
          if (newTime >= 7200 && !notificationRef.current.twoHours) {
            sendNotification('Session longue', 'Vous travaillez depuis 2 heures d\'affilée. Pensez à faire une pause !');
            notificationRef.current.twoHours = true;
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state]);

  // Check daily 4-hour limit
  useEffect(() => {
    if (state === 'running' && elapsedTime > 0) {
      checkDailyLimit();
    }
  }, [elapsedTime, state]);

  const checkDailyLimit = async () => {
    if (notificationRef.current.fourHours) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This would need the getSessionsByDateRange from useSessions
    // For now, we'll check total elapsed time of current session
    const totalSeconds = elapsedTime + pausedTime;
    if (totalSeconds >= 14400) { // 4 hours = 14400 seconds
      sendNotification('Limite quotidienne', 'Vous avez travaillé 4 heures aujourd\'hui. Pensez à vous reposer !');
      notificationRef.current.fourHours = true;
    }
  };

  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleStart = async () => {
    if (!selectedCategoryId) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }

    await requestNotificationPermission();

    const { data } = await createSession(selectedCategoryId);
    if (data) {
      setCurrentSession(data);
      setSessionStartTime(new Date());
      setState('running');
      setElapsedTime(0);
      setPausedTime(0);
      notificationRef.current = { twoHours: false, fourHours: false };
    }
  };

  const handlePause = () => {
    if (state === 'running') {
      setState('paused');
      setPauseStartTime(new Date());
    } else if (state === 'paused') {
      if (pauseStartTime) {
        const pauseDuration = Math.floor((new Date().getTime() - pauseStartTime.getTime()) / 1000);
        setPausedTime((prev) => prev + pauseDuration);
      }
      setPauseStartTime(null);
      setState('running');
    }
  };

  const handleStop = async () => {
    if (!currentSession) return;

    // If currently paused, add the pause duration
    let totalPausedTime = pausedTime;
    if (state === 'paused' && pauseStartTime) {
      const currentPauseDuration = Math.floor((new Date().getTime() - pauseStartTime.getTime()) / 1000);
      totalPausedTime += currentPauseDuration;
    }

    await endSession(currentSession.id, totalPausedTime);

    // Reset state
    setState('idle');
    setCurrentSession(null);
    setSessionStartTime(null);
    setPauseStartTime(null);
    setElapsedTime(0);
    setPausedTime(0);
    notificationRef.current = { twoHours: false, fourHours: false };
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

  return (
    <div className="space-y-4">
      {/* Category selection */}
      {state === 'idle' && (
        <div>
          <label className="block text-sm font-medium mb-2">Catégorie</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Timer display */}
      <div className="text-center">
        {state !== 'idle' && selectedCategory && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: selectedCategory.color + '20' }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
              <span className="font-medium" style={{ color: selectedCategory.color }}>
                {selectedCategory.name}
              </span>
            </div>
          </div>
        )}

        <div className="text-6xl font-mono font-bold mb-6">
          {formatTime(elapsedTime)}
        </div>

        {state === 'paused' && (
          <div className="text-yellow-600 dark:text-yellow-400 mb-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-yellow-600 dark:bg-yellow-400 rounded-full animate-pulse"></span>
            En pause
          </div>
        )}

        {state === 'running' && (
          <div className="text-green-600 dark:text-green-400 mb-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></span>
            En cours
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex gap-2 justify-center">
        {state === 'idle' ? (
          <button
            onClick={handleStart}
            disabled={!selectedCategoryId}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Démarrer
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                state === 'paused'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {state === 'paused' ? 'Reprendre' : 'Pause'}
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Arrêter
            </button>
          </>
        )}
      </div>
    </div>
  );
}
