"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Sun, Moon, LogIn } from "lucide-react"
import { createClient } from "@supabase/supabase-js" // <--- Changing to the standard client

export default function Navbar() {
    const { theme, setTheme } = useTheme()

    // Create the client manually using your env variables
    // This bypasses the specific "auth-helper" version issue
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // This redirects them back to your homepage after login
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <nav className="border-b bg-background sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Left Side: Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            ACG <span className="text-blue-600">Climbers</span>
                        </Link>
                    </div>

                    {/* Right Side: Actions */}
                    <div className="flex items-center gap-4">

                        {/* Dark Mode Toggle Button */}
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 top-1/2 -translate-y-1/2 right-2" />
                            <span className="sr-only">Toggle theme</span>
                        </button>

                        {/* Google Sign In Button */}
                        <button
                            onClick={handleLogin}
                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                        >
                            <LogIn className="h-4 w-4" />
                            Sign in with Google
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}