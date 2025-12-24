import { createClient } from "@/lib/supabase/server" // Check if this path exists, if not use standard import below
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  // 1. Check if user is already logged in
  // If your project doesn't have "@/lib/supabase/server" yet,
  // you can comment out these 5 lines for now to just test the UI.
  /*
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    redirect("/dashboard")
  }
  */

  return (
      // We use 'bg-background' and 'text-foreground' to respect the theme
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background text-foreground p-4">

        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
              ACG <span className="text-blue-600">Climbers</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Adaptive Climbing Sessions Management
            </p>
          </div>

          <div className="bg-card text-card-foreground border shadow-sm rounded-xl p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground">
                Sign in to manage events and volunteer schedules.
              </p>
            </div>

            {/* We don't need a button here since the Navbar has one,
              but if you want a big CTA button: */}
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Use the "Sign in" button in the top right to get started.
              </p>
            </div>
          </div>
        </div>
      </main>
  )
}