'use client';

import { useMemo, useState } from 'react';
import { useSessions } from '@/lib/hooks/useSessions';
import { useCategories } from '@/lib/hooks/useCategories';
import { getWeeklyStats, formatDuration } from '@/lib/stats';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function WeeklyStats() {
  const { sessions, loading: sessionsLoading } = useSessions();
  const { categories, loading: categoriesLoading } = useCategories();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const stats = useMemo(() => {
    if (!sessions || !categories) return null;
    return getWeeklyStats(sessions, categories, currentWeek);
  }, [sessions, categories, currentWeek]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  if (sessionsLoading || categoriesLoading) {
    return <div className="text-center py-8">Chargement des statistiques...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8">Aucune donnée disponible</div>;
  }

  // Prepare data for bar chart (daily)
  const dailyChartData = stats.daily_stats.map((day) => {
    const data: any = {
      date: format(new Date(day.date), 'EEE dd', { locale: fr }),
      total: Math.round(day.total_duration / 60), // convert to minutes
    };

    // Add each category as a separate bar
    Object.entries(day.categories).forEach(([categoryId, categoryData]) => {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        data[category.name] = Math.round(categoryData.duration / 60);
      }
    });

    return data;
  });

  // Prepare data for pie chart (by category)
  const categoryChartData = stats.category_stats.map((stat) => ({
    name: stat.category_name,
    value: Math.round(stat.total_duration / 60), // minutes
    color: stat.category_color,
  }));

  return (
    <div className="space-y-6">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← Semaine précédente
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Statistiques hebdomadaires</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {format(weekStart, 'dd MMM', { locale: fr })} - {format(weekEnd, 'dd MMM yyyy', { locale: fr })}
          </p>
        </div>
        <button
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Semaine suivante →
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Temps total</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatDuration(stats.total_duration)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nombre de sessions</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.session_count}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Moyenne par session</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.session_count > 0 ? formatDuration(Math.round(stats.total_duration / stats.session_count)) : '0min'}
          </div>
        </div>
      </div>

      {/* Daily bar chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Temps par jour (minutes)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {stats.category_stats.map((stat) => (
              <Bar
                key={stat.category_id}
                dataKey={stat.category_name}
                fill={stat.category_color}
                stackId="stack"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        {categoryChartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Répartition par catégorie</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}min`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category details table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Détails par catégorie</h3>
          <div className="space-y-3">
            {stats.category_stats.map((stat) => (
              <div key={stat.category_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stat.category_color }}
                  />
                  <div>
                    <div className="font-medium">{stat.category_name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.session_count} session{stat.session_count > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatDuration(stat.total_duration)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ~{formatDuration(stat.average_duration)}/session
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
