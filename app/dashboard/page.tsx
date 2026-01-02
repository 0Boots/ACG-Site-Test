'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    activeClimbers: 0, // Placeholder logic
    helpedTotal: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get Upcoming Events Count
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', new Date().toISOString());

      // 2. Get "Climbers" Count (Total profiles with role 'climber')
      const { count: climberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'climber');

      // 3. Get Recent Events (last 3)
      const { data: recent } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true })
        .limit(3);

      setStats({
        upcomingEvents: eventsCount || 0,
        activeClimbers: climberCount || 0,
        helpedTotal: 142, // Dummy data for now, requires deeper query
      });
      setRecentEvents(recent || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Calendar className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
            <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <Users className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Registered Climbers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeClimbers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Sessions Completed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.helpedTotal}</p>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY / UPCOMING LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentEvents.map((event) => (
            <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-center px-4 py-2 bg-gray-100 rounded-lg">
                    <span className="block text-xs font-bold text-gray-500 uppercase">
                      {format(new Date(event.start_time), 'MMM')}
                    </span>
                    <span className="block text-xl font-bold text-gray-900">
                      {format(new Date(event.start_time), 'dd')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{event.title}</h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {format(new Date(event.start_time), 'h:mm a')}
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Open
                </span>
              </div>
            </div>
          ))}
          {recentEvents.length === 0 && (
            <div className="p-6 text-center text-gray-500">No upcoming events found.</div>
          )}
        </div>
      </div>
    </div>
  );
}