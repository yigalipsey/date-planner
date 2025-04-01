import { DatePlanner } from "@/components/date-planner";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between w-[90%] mx-auto items-center mb-4">
          <Link
            href="/send-email"
            className="text-3xl font-bold text-slate-800 hover:text-slate-600 transition-colors"
          >
            יגאל & טלי
          </Link>
          <Link href="/notify"></Link>
        </div>
        <DatePlanner />
      </div>
    </main>
  );
}
