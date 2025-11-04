import type { Session, Category } from '@/types/database';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface SessionWithCategory extends Session {
  category: Category;
}

export interface DailyStats {
  date: string;
  total_duration: number;
  session_count: number;
  categories: {
    [categoryId: string]: {
      duration: number;
      count: number;
    };
  };
}

export interface CategoryStats {
  category_id: string;
  category_name: string;
  category_color: string;
  total_duration: number;
  session_count: number;
  average_duration: number;
}

export interface PeriodStats {
  total_duration: number;
  session_count: number;
  daily_stats: DailyStats[];
  category_stats: CategoryStats[];
}

/**
 * Calculate statistics for a given period
 */
export function calculatePeriodStats(
  sessions: Session[],
  categories: Category[],
  startDate: Date,
  endDate: Date
): PeriodStats {
  // Filter sessions within the period
  const periodSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.start_time);
    return sessionDate >= startDate && sessionDate <= endDate && session.total_duration !== null;
  });

  // Calculate total stats
  const total_duration = periodSessions.reduce((sum, session) => sum + (session.total_duration || 0), 0);
  const session_count = periodSessions.length;

  // Calculate daily stats
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const daily_stats: DailyStats[] = days.map((day) => {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const daySessions = periodSessions.filter((session) => {
      const sessionDate = new Date(session.start_time);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });

    const categories_stats: DailyStats['categories'] = {};
    daySessions.forEach((session) => {
      if (!categories_stats[session.category_id]) {
        categories_stats[session.category_id] = { duration: 0, count: 0 };
      }
      categories_stats[session.category_id].duration += session.total_duration || 0;
      categories_stats[session.category_id].count += 1;
    });

    return {
      date: format(day, 'yyyy-MM-dd'),
      total_duration: daySessions.reduce((sum, s) => sum + (s.total_duration || 0), 0),
      session_count: daySessions.length,
      categories: categories_stats,
    };
  });

  // Calculate category stats
  const category_stats: CategoryStats[] = categories.map((category) => {
    const categorySessions = periodSessions.filter((s) => s.category_id === category.id);
    const totalDuration = categorySessions.reduce((sum, s) => sum + (s.total_duration || 0), 0);
    const count = categorySessions.length;

    return {
      category_id: category.id,
      category_name: category.name,
      category_color: category.color,
      total_duration: totalDuration,
      session_count: count,
      average_duration: count > 0 ? Math.round(totalDuration / count) : 0,
    };
  }).filter((stat) => stat.session_count > 0); // Only include categories with sessions

  return {
    total_duration,
    session_count,
    daily_stats,
    category_stats,
  };
}

/**
 * Get weekly stats
 */
export function getWeeklyStats(sessions: Session[], categories: Category[], referenceDate: Date = new Date()): PeriodStats {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 }); // Sunday
  return calculatePeriodStats(sessions, categories, weekStart, weekEnd);
}

/**
 * Get monthly stats
 */
export function getMonthlyStats(sessions: Session[], categories: Category[], referenceDate: Date = new Date()): PeriodStats {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  return calculatePeriodStats(sessions, categories, monthStart, monthEnd);
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

/**
 * Format duration in seconds to HH:MM:SS
 */
export function formatDurationFull(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
