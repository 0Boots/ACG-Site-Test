'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Clock, Calendar as CalendarIcon, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  profiles: { full_name: string } | null; // Allow null in case profile is missing
}

export default function DashboardHome() {
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedEvents, setJoinedEvents] = useState<Set<string>>(new Set());

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Get Recent Events
      // FIX: Changed 'profiles:created_by' to just 'profiles'
      // This is the standard way Supabase connects tables.
      // 1. Get Recent Events
      // We use 'profiles:created_by' to tell Supabase exactly which column to use
      const { data: recent, error } = await supabase
          .from('events')
          .select(`
            *,
            profiles:created_by (full_name)
          `)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(3);

      if (error) {
        console.error("Error fetching events:", error.message);
      }

      // 2. Check joined status
      if (user && recent && recent.length > 0) {
        const eventIds = recent.map((e: any) => e.id);
        const { data: attendees } = await supabase
            .from('event_attendees')
            .select('event_id')
            .eq('user_id', user.id)
            .in('event_id', eventIds);

        if (attendees) {
          setJoinedEvents(new Set(attendees.map((a: any) => a.event_id)));
        }
      }

      // 3. Safe Cast
      // We map over the data to handle cases where 'profiles' might be an array or object
      const formattedEvents = (recent || []).map((event: any) => ({
        ...event,
        profiles: Array.isArray(event.profiles) ? event.profiles[0] : event.profiles
      }));

      setRecentEvents(formattedEvents);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleJoin = async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in first");

    const { error } = await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: user.id } as any)

    if (error) {
      alert("Could not join (You might already be registered)");
    } else {
      setJoinedEvents(prev => new Set(prev).add(eventId));
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading dashboard...</div>;

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500">Your upcoming activity overview.</p>
          </div>
          <button
              onClick={() => router.push('/dashboard/events')}
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
          >
            View Full Calendar →
          </button>
        </div>

        {/* Detailed Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentEvents.map((event) => {
            const isJoined = joinedEvents.has(event.id);
            return (
                <div key={event.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all flex flex-col">

                  {/* Header with Date */}
                  <div className="bg-gray-50 dark:bg-slate-800 px-6 py-3 border-b dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(new Date(event.start_time), 'EEE, MMM d')}
                    </div>
                    {isJoined && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Going</span>}
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>

                    <div className="space-y-3 mt-4">
                      {/* Location */}
                      {event.location && (
                          <a
                              href={`http://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-500"
                          >
                            <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                            <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                          </a>
                      )}

                      {/* Time */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {format(new Date(event.start_time), 'h:mm a')} - {event.end_time ? format(new Date(event.end_time), 'h:mm a') : 'TBD'}
                      </div>

                      {/* Leader */}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 pt-2 border-t dark:border-slate-800">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Led by <span className="font-medium text-gray-900 dark:text-white">{event.profiles?.full_name || 'Volunteer'}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t dark:border-slate-700">
                    <button
                        onClick={() => !isJoined && handleJoin(event.id)}
                        disabled={isJoined}
                        className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                            isJoined
                                ? "bg-green-100 text-green-800 cursor-default"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                      {isJoined ? "✓ Registered" : "Join Session"}
                    </button>
                  </div>
                </div>
            );
          })}

          {recentEvents.length === 0 && (
              <div className="col-span-full p-12 text-center border-2 border-dashed rounded-xl dark:border-slate-700">
                <p className="text-gray-500">No upcoming events scheduled.</p>
                <p className="text-sm text-gray-400 mt-2">(Check the console if you think this is an error)</p>
              </div>
          )}
        </div>
      </div>
  );
}