import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { Lead } from '../types';
import { ArrowLeft, Mail, User, Clock, Activity, Target } from 'lucide-react';

export const LeadDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<{ success: boolean; data: Lead }>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await api.get(`/leads/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-[400px]">
        <div className="flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          Loading lead details...
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Lead Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">We couldn't find the details for this lead.</p>
        <button onClick={() => navigate('/leads')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Go back to Leads
        </button>
      </div>
    );
  }

  const lead = data.data;

  const statusColors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Contacted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Qualified': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Lost': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link to="/leads" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} />
          Back to Leads
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lead Details</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status]}`}>
            {lead.status}
          </span>
        </div>
      </div>

      <div className="glass rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden shadow-2xl shadow-gray-200/20 dark:shadow-none">
        <div className="p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-2xl font-bold">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lead.name}</h2>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                <Mail size={16} />
                <span>{lead.email}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                <User size={16} /> Contact Information
              </h3>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 rounded-2xl p-5 shadow-sm">
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold tracking-wider">Full Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">{lead.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold tracking-wider">Email Address</p>
                  <a href={`mailto:${lead.email}`} className="text-primary-600 dark:text-primary-400 font-medium hover:underline">{lead.email}</a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                <Activity size={16} /> Lead Information
              </h3>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Target size={16} /> Source</span>
                  <span className="font-medium text-gray-900 dark:text-white">{lead.source}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Activity size={16} /> Status</span>
                  <span className="font-medium text-gray-900 dark:text-white">{lead.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><Clock size={16} /> Created</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(lead.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
