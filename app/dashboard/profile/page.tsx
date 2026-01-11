'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Save, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    // Form States
    const [bio, setBio] = useState('');
    const [notes, setNotes] = useState('');
    const [style, setStyle] = useState('Boulder');

    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Profile Data
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const profileData = data as any;

            // If no avatar in DB yet, grab it from Google Auth metadata
            if (profileData && !profileData.avatar_url && user.user_metadata?.avatar_url) {
                profileData.avatar_url = user.user_metadata.avatar_url;

                // @ts-ignore: Force update despite outdated types
                await supabase.from('profiles').update({ avatar_url: profileData.avatar_url }).eq('id', user.id);
            }

            if (profileData) {
                setProfile(profileData);
                setBio(profileData.bio || '');
                setNotes(profileData.special_notes || '');
                setStyle(profileData.climbing_style || 'Boulder');
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);

        // @ts-ignore: Force update despite outdated types
        const { error } = await supabase
            .from('profiles')
            .update({
                bio,
                special_notes: notes,
                climbing_style: style,
            })
            .eq('id', profile.id);

        if (error) {
            console.error(error);
            alert('Error updating profile');
        } else {
            alert('Profile updated successfully!');
        }
        setSaving(false);
    };

    if (loading) return <div className="p-10">Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>

            {/* ID CARD SECTION */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-start gap-6">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-indigo-50 dark:border-indigo-900/30">
                    {profile?.avatar_url ? (
                        <Image
                            src={profile.avatar_url}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                            <User size={40} />
                        </div>
                    )}
                </div>

                <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.full_name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{profile?.email}</p>
                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 capitalize">
                        {profile?.role || 'Climber'}
                    </div>
                </div>
            </div>

            {/* EDIT FORM */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Climbing Style</label>
                    <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    >
                        <option value="Boulder">Bouldering</option>
                        <option value="Top Rope">Top Rope</option>
                        <option value="Lead">Lead Climbing</option>
                        <option value="Adaptive">Adaptive / Assisted</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Personal Bio</label>
                    <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us a bit about your climbing journey..."
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Special Notes <span className="text-gray-400 font-normal">(Medical needs, accessibility requirements, etc.)</span>
                    </label>
                    <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any specific needs the leads should be aware of?"
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white bg-yellow-50 dark:bg-yellow-900/10"
                    />
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}