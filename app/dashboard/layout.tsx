'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Calendar, LogOut, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch Profile Details
      const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

      // FIX: Cast data to 'any' so we can spread it {...data} without errors
      const profileData = data as any;

      if (profileData) {
        // Fallback to Google Avatar if DB one is empty
        const avatar = profileData.avatar_url || user.user_metadata?.avatar_url;
        setUserProfile({ ...profileData, avatar_url: avatar });
      }
    };
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Events', href: '/dashboard/events', icon: Calendar },
  ];

  return (
      <div className="min-h-screen flex bg-gray-50 dark:bg-slate-950">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col fixed h-full">
          <div className="p-6 border-b border-gray-100 dark:border-slate-800">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <span className="text-2xl">▲</span> ACG Manager
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                  <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800'
                      }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
              );
            })}
          </nav>

          {/* BOTTOM USER PROFILE SECTION */}
          <div className="p-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              {/* Avatar Circle */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                {userProfile?.avatar_url ? (
                    <Image src={userProfile.avatar_url} alt="Profile" fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <User size={20} />
                    </div>
                )}
              </div>

              {/* Name & Role (Clickable) */}
              <Link href="/dashboard/profile" className="flex-1 min-w-0 hover:underline">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {userProfile?.full_name || 'Loading...'}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {userProfile?.role || 'Climber'}
                </p>
              </Link>
            </div>

            <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 w-full px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
  );
}