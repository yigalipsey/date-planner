import { DatePlanner } from "@/components/date-planner"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">יגאל & טלי</h1>
        <DatePlanner />
      </div>
    </main>
  )
}

