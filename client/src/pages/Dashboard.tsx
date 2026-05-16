import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, BarChart } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Here's what's happening with your leads today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Total Leads', value: '1,248', icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
          { title: 'Qualified Leads', value: '425', icon: TrendingUp, color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
          { title: 'Conversion Rate', value: '34.2%', icon: BarChart, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to manage your leads?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Head over to the leads dashboard to filter, search, and update the status of all your incoming leads.</p>
        <Link 
          to="/leads" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors"
        >
          Go to Leads Dashboard
        </Link>
      </div>
    </div>
  );
};
