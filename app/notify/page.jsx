"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotifyPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      toast({
        title: "התראה נשלחה בהצלחה",
        description: "ההתראה נשלחה לכל המשתמשים המנויים",
      });

      // Clear form
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "שגיאה בשליחת התראה",
        description: "אירעה שגיאה בשליחת ההתראה. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="shadow-lg rtl">
        <CardHeader>
          <CardTitle>שליחת התראה למשתמשים</CardTitle>
          <CardDescription>
            שלח התראה לכל המשתמשים שאישרו קבלת התראות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">כותרת ההתראה</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="הכנס כותרת להתראה"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">תוכן ההתראה</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="הכנס את תוכן ההתראה"
                required
              />
            </div>
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                חזרה
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "שולח..." : "שלח התראה"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
