'use client';

import { useState } from 'react';
import TimerWidget from '@/components/TimerWidget';
import CategoryManager from '@/components/CategoryManager';
import WeeklyStats from '@/components/WeeklyStats';
import MonthlyStats from '@/components/MonthlyStats';

type Tab = 'timer' | 'categories' | 'weekly' | 'monthly';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');

  const tabs = [
    { id: 'timer' as Tab, label: 'Chronomètre', icon: '⏱️' },
    { id: 'categories' as Tab, label: 'Catégories', icon: '📁' },
    { id: 'weekly' as Tab, label: 'Hebdomadaire', icon: '📊' },
    { id: 'monthly' as Tab, label: 'Mensuel', icon: '📈' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            WorkTimer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez votre temps de travail par catégorie
          </p>
        </div>

        {/* Tab navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
          {activeTab === 'timer' && (
            <div className="max-w-2xl mx-auto">
              <TimerWidget />
            </div>
          )}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'weekly' && <WeeklyStats />}
          {activeTab === 'monthly' && <MonthlyStats />}
        </div>
      </div>
    </main>
  );
}
