"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Send } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function SendEmail() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!to || !subject || !message) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch("/api/send-custom-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast({
        title: "המייל נשלח בהצלחה",
        description: "המייל נשלח לנמען בהצלחה",
      });

      // Reset form
      setTo("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "שגיאה בשליחת המייל",
        description: "אירעה שגיאה בשליחת המייל. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl rtl">
      <div className="flex items-center mb-6">
        <Link
          href="/"
          className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowRight className="h-5 w-5 ml-1" />
          חזרה
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">שליחת מייל מדייטי</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-500 mb-1 block">
                נמען
              </label>
              <Input
                type="email"
                placeholder="כתובת מייל"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 mb-1 block">
                נושא
              </label>
              <Input
                type="text"
                placeholder="נושא המייל"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 mb-1 block">
                תוכן
              </label>
              <Textarea
                placeholder="תוכן המייל"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-right min-h-[200px]"
                dir="rtl"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSending}>
              {isSending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <Send className="ml-2 h-4 w-4" />
                  שלח מייל
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
