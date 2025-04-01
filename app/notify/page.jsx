"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function NotifyPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body: message,
        icon: "/icons/logoyigalandtali.png",
      });

      toast({
        title: "ההתראה נשלחה!",
        description: "ההתראה תוצג למשתמשים כשהם יפתחו את האפליקציה",
      });

      setTitle("");
      setMessage("");
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לשלוח את ההתראה",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">שליחת התראה</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">כותרת</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="הכנס כותרת להתראה"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">הודעה</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="הכנס את תוכן ההתראה"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          שלח התראה
        </Button>
      </form>
    </div>
  );
}
