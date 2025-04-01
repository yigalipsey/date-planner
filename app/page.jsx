import { DatePlanner } from "@/components/date-planner";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">יגאל & טלי</h1>
          <Link href="/notify">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <DatePlanner />
      </div>
    </main>
  );
}
