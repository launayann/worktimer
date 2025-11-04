'use client';

import { useMemo, useState } from 'react';
import { useSessions } from '@/lib/hooks/useSessions';
import { useCategories } from '@/lib/hooks/useCategories';
import { getMonthlyStats, formatDuration } from '@/lib/stats';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function MonthlyStats() {
  const { sessions, loading: sessionsLoading } = useSessions();
  const { categories, loading: categoriesLoading } = useCategories();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const stats = useMemo(() => {
    if (!sessions || !categories) return null;
    return getMonthlyStats(sessions, categories, currentMonth);
  }, [sessions, categories, currentMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  if (sessionsLoading || categoriesLoading) {
    return <div className="text-center py-8">Chargement des statistiques...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8">Aucune donnée disponible</div>;
  }

  // Prepare data for line chart (daily trend)
  const dailyChartData = stats.daily_stats.map((day) => ({
    date: format(new Date(day.date), 'dd MMM', { locale: fr }),
    minutes: Math.round(day.total_duration / 60),
    sessions: day.session_count,
  }));

  // Prepare data for pie chart (by category)
  const categoryChartData = stats.category_stats.map((stat) => ({
    name: stat.category_name,
    value: Math.round(stat.total_duration / 60),
    color: stat.category_color,
  }));

  // Prepare data for category bar chart
  const categoryBarData = stats.category_stats.map((stat) => ({
    name: stat.category_name,
    minutes: Math.round(stat.total_duration / 60),
    sessions: stat.session_count,
    color: stat.category_color,
  }));

  return (
    <div className="space-y-6">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← Mois précédent
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Statistiques mensuelles</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {format(monthStart, 'MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Mois suivant →
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Moyenne par jour</div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats.daily_stats.length > 0 ? formatDuration(Math.round(stats.total_duration / stats.daily_stats.length)) : '0min'}
          </div>
        </div>
      </div>

      {/* Daily trend line chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Évolution quotidienne (minutes)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} name="Minutes" />
          </LineChart>
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

        {/* Category bar chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Temps par catégorie (minutes)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryBarData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minutes" fill="#3b82f6">
                {categoryBarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category details table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Détails par catégorie</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-3 px-4">Catégorie</th>
                <th className="text-right py-3 px-4">Temps total</th>
                <th className="text-right py-3 px-4">Sessions</th>
                <th className="text-right py-3 px-4">Moyenne/session</th>
              </tr>
            </thead>
            <tbody>
              {stats.category_stats.map((stat) => (
                <tr key={stat.category_id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: stat.category_color }}
                      />
                      <span className="font-medium">{stat.category_name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">
                    {formatDuration(stat.total_duration)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {stat.session_count}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">
                    {formatDuration(stat.average_duration)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
