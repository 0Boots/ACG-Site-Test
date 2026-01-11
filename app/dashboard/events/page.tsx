'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Calendar as CalendarIcon, Clock, Search, Plus, ExternalLink, List } from 'lucide-react';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Calendar Localizer Setup
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('climber');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list'); // Toggle State
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get User Role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (profile) setUserRole((profile as any).role);
      }

      // 2. Get Events
      const { data, error } = await supabase
          .from('events')
          .select(`*, profiles:created_by (full_name)`)
          .order('start_time', { ascending: true });

      if (data && !error) setEvents(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleJoin = async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in");

    // Check your table name here
    const { error } = await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: user.id } as any);

    if (!error) {
      alert('Success: You have joined this climb!');
    } else {
      alert('You are likely already registered.');
    }
  };

  // Prepare Calendar Events
  const calendarEvents = events.map(event => ({
    title: event.title,
    start: new Date(event.start_time),
    end: new Date(event.end_time || event.start_time),
    resource: event,
  }));

  // Filter Logic for List View
  const filteredEvents = events.filter(event =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="space-y-6 h-full flex flex-col">
        {/* HEADER & CONTROLS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Events</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage or join climbing sessions.</p>
          </div>

          <div className="flex gap-3">
            {/* View Toggles */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      viewMode === 'list'
                          ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <List className="w-4 h-4"/> List
              </button>
              <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      viewMode === 'calendar'
                          ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <CalendarIcon className="w-4 h-4"/> Calendar
              </button>
            </div>

            {userRole === 'lead' && (
                <Link href="/events/create" className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
                  <Plus className="w-4 h-4 mr-2" /> Create
                </Link>
            )}
          </div>
        </div>

        {loading ? (
            <div className="text-center py-10 dark:text-gray-400">Loading events...</div>
        ) : (
            <>
              {/* ----- VIEW: CALENDAR ----- */}
              {viewMode === 'calendar' && (
                  <div className="h-[600px] bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700 text-black dark:text-white">
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        views={[Views.MONTH, Views.WEEK, Views.DAY]}
                        defaultView={Views.MONTH}
                        eventPropGetter={() => ({
                          className: 'bg-indigo-600 text-white rounded-md border-none text-xs p-1'
                        })}
                    />
                  </div>
              )}

              {/* ----- VIEW: LIST (CARDS) ----- */}
              {viewMode === 'list' && (
                  <>
                    {/* Search Bar */}
                    <div className="relative max-w-md">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                          type="text"
                          placeholder="Search events..."
                          className="block w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredEvents.map((event) => (
                          <div key={event.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all flex flex-col">

                            {/* Card Header */}
                            <div className="bg-gray-50 dark:bg-slate-800 px-6 py-3 border-b dark:border-slate-700 flex justify-between items-center">
                              <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {format(new Date(event.start_time), 'EEE, MMM d')}
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-grow">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                              <div className="space-y-3">
                                {event.location && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-start text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-500"
                                    >
                                      <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                                      <span className="truncate">{event.location}</span>
                                      <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                )}

                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                  {format(new Date(event.start_time), 'h:mm a')} - {event.end_time ? format(new Date(event.end_time), 'h:mm a') : 'TBD'}
                                </div>
                              </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t dark:border-slate-700 flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Led by {event.profiles?.full_name || 'Lead'}
                      </span>
                              <button
                                  onClick={() => handleJoin(event.id)}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
                              >
                                Join
                              </button>
                            </div>
                          </div>
                      ))}
                    </div>
                  </>
              )}
            </>
        )}
      </div>
  );
}