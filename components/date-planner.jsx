"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Bell,
  BellOff,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// Get the current week number
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000; // milliseconds in a week
  return Math.ceil(diff / oneWeek);
};

// Determine who's planning based on week number
const getPlanner = (weekNumber, partnerA, partnerB) => {
  return weekNumber % 2 === 0 ? partnerA : partnerB;
};

export function DatePlanner() {
  const [partnerA, setPartnerA] = useState("יגאל");
  const [partnerB, setPartnerB] = useState("טלי");
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [isPlanned, setIsPlanned] = useState(false);
  const [dateDetails, setDateDetails] = useState("");
  const [planningHistory, setPlanningHistory] = useState({});
  const [dateDetailsHistory, setDateDetailsHistory] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [dateLocation, setDateLocation] = useState("");
  const [isSurpriseLocation, setIsSurpriseLocation] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("datePlanningHistory");
    const savedPartnerA = localStorage.getItem("partnerA");
    const savedPartnerB = localStorage.getItem("partnerB");
    const savedDateDetailsHistory = localStorage.getItem("dateDetailsHistory");
    const savedLocation = localStorage.getItem("dateLocation");
    const savedIsSurpriseLocation = localStorage.getItem("isSurpriseLocation");

    if (savedHistory) {
      setPlanningHistory(JSON.parse(savedHistory));
    }

    if (savedPartnerA) {
      setPartnerA(savedPartnerA);
    }

    if (savedPartnerB) {
      setPartnerB(savedPartnerB);
    }

    if (savedDateDetailsHistory) {
      setDateDetailsHistory(JSON.parse(savedDateDetailsHistory));
    }

    if (savedLocation) {
      setDateLocation(savedLocation);
    }

    if (savedIsSurpriseLocation) {
      setIsSurpriseLocation(JSON.parse(savedIsSurpriseLocation));
    }

    // Check if current week is already planned and load date details
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setIsPlanned(!!history[currentWeek]);
    }

    if (savedDateDetailsHistory) {
      const detailsHistory = JSON.parse(savedDateDetailsHistory);
      if (detailsHistory[currentWeek]) {
        setDateDetails(detailsHistory[currentWeek]);
      } else {
        setDateDetails("");
      }
    }
  }, [currentWeek]);

  // Save planning history to localStorage
  useEffect(() => {
    localStorage.setItem(
      "datePlanningHistory",
      JSON.stringify(planningHistory)
    );
  }, [planningHistory]);

  // Save date details history to localStorage
  useEffect(() => {
    localStorage.setItem(
      "dateDetailsHistory",
      JSON.stringify(dateDetailsHistory)
    );
  }, [dateDetailsHistory]);

  // Save partner names to localStorage
  useEffect(() => {
    localStorage.setItem("partnerA", partnerA);
    localStorage.setItem("partnerB", partnerB);
  }, [partnerA, partnerB]);

  // Save location to localStorage
  useEffect(() => {
    localStorage.setItem("dateLocation", dateLocation);
  }, [dateLocation]);

  useEffect(() => {
    localStorage.setItem(
      "isSurpriseLocation",
      JSON.stringify(isSurpriseLocation)
    );
  }, [isSurpriseLocation]);

  // Load notification settings
  useEffect(() => {
    const savedNotificationsEnabled = localStorage.getItem(
      "notificationsEnabled"
    );
    if (savedNotificationsEnabled) {
      setNotificationsEnabled(JSON.parse(savedNotificationsEnabled));
    }

    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Save notification settings
  useEffect(() => {
    localStorage.setItem(
      "notificationsEnabled",
      JSON.stringify(notificationsEnabled)
    );
  }, [notificationsEnabled]);

  // Check if device is iOS
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    setIsIOS(checkIsIOS());
  }, []);

  // Check if running as PWA
  useEffect(() => {
    const checkIsPWA = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone ||
        document.referrer.includes("android-app://")
      );
    };
    setIsPWA(checkIsPWA());
  }, []);

  const handleMarkPlanned = () => {
    if (!dateDetails.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין פרטי דייט לפני שמסמנים כמתוכנן",
        variant: "destructive",
      });
      return;
    }

    if (!isSurpriseLocation && !dateLocation.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין מיקום או לסמן כהפתעה",
        variant: "destructive",
      });
      return;
    }

    setIsPlanned(true);
    setPlanningHistory((prev) => ({
      ...prev,
      [currentWeek]: true,
    }));

    // Show local notification after 3 seconds
    if (notificationsEnabled) {
      showLocalNotification(
        "דייט חדש תוכנן! 🎉",
        `${getPlanner(currentWeek, partnerA, partnerB)} תכנן/ה דייט חדש`,
        3000 // 3 seconds delay
      );
    }

    toast({
      title: "הדייט תוכנן בהצלחה! 🎉",
      description: "פרטי הדייט נשמרו",
    });
  };

  const handleMarkUnplanned = () => {
    setIsPlanned(false);
    setPlanningHistory((prev) => ({
      ...prev,
      [currentWeek]: false,
    }));
  };

  const handlePartnerNameChange = (partner, name) => {
    if (partner === "A") {
      setPartnerA(name);
    } else {
      setPartnerB(name);
    }
  };

  const handleDateDetailsChange = (e) => {
    const newDetails = e.target.value;
    setDateDetails(newDetails);
    setDateDetailsHistory((prev) => ({
      ...prev,
      [currentWeek]: newDetails,
    }));
  };

  // Get history weeks (all weeks that have either planning status or date details)
  const getHistoryWeeks = () => {
    const weeks = new Set();

    // Add weeks from planning history
    Object.keys(planningHistory).forEach((week) => {
      weeks.add(Number.parseInt(week));
    });

    // Add weeks from date details history
    Object.keys(dateDetailsHistory).forEach((week) => {
      weeks.add(Number.parseInt(week));
    });

    // Convert to array, sort in descending order (newest first), and filter out current week
    return Array.from(weeks)
      .filter((week) => week !== currentWeek)
      .sort((a, b) => b - a);
  };

  const historyWeeks = getHistoryWeeks();

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered");
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const subscribeToPush = async (registration) => {
    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key is missing");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      console.log("Push subscription:", subscription);

      // Save subscription to server
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      return subscription;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      throw error;
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "בדיקת התראות",
          message: "מעולה! ההתראות עובדות בהצלחה 🎉",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send test notification");
      }

      const result = await response.json();
      if (result.sent === 0) {
        throw new Error("No active subscriptions found");
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      throw error;
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const registration = await registerServiceWorker();
          if (registration) {
            // Show test notification after 2 seconds
            showLocalNotification(
              "התראות הופעלו! 🎉",
              "בדיקה: תקבל/י את ההתראה הזו תוך 2 שניות",
              2000 // 2 seconds delay
            );

            setNotificationsEnabled(true);
            setNotificationPermission("granted");

            toast({
              title: "התראות הופעלו",
              description: "תקבל/י התראות על דייטים חדשים",
            });
          }
        } else {
          toast({
            title: "לא ניתן להפעיל התראות",
            description: "נא לאפשר התראות בדפדפן",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error enabling notifications:", error);
        toast({
          title: "שגיאה בהפעלת התראות",
          description:
            error.message || "אירעה שגיאה בהפעלת ההתראות. אנא נסה שוב.",
          variant: "destructive",
        });
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
      toast({
        title: "התראות הושבתו",
        description: "לא תקבל יותר התראות",
      });
    }
  };

  // Function to show local notification
  const showLocalNotification = async (title, body, delay = 0) => {
    if (!notificationsEnabled) return;

    // Wait for the specified delay
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: "/icons/android-chrome-192x192.png",
      badge: "/icons/notification-badge.png",
      vibrate: [200, 100, 200],
      tag: "date-planner",
      requireInteraction: true,
      actions: [
        {
          action: "open",
          title: "פתח אפליקציה",
        },
      ],
      data: {
        url: window.location.origin,
      },
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="shadow-lg rtl mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>שבוע {currentWeek}</CardTitle>
            <Badge
              variant={isPlanned ? "default" : "outline"}
              className={cn(
                "mr-2 px-4 py-1.5 text-base font-medium",
                isPlanned && "bg-[#34C759] hover:bg-[#34C759]/90",
                !isPlanned && "bg-red-500 hover:bg-red-600 text-white border-0"
              )}
            >
              {isPlanned ? "מתוכנן" : "לא מתוכנן"}
            </Badge>
          </div>
          <CardDescription>
            <div className="flex items-center mt-2">
              <Calendar className="ml-2 h-4 w-4" />
              <span>
                {new Date().toLocaleDateString("he-IL", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500 mb-1">
                מתכנן/ת השבוע
              </h3>
              <p className="text-xl font-bold">
                {getPlanner(currentWeek, partnerA, partnerB)}
              </p>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center">
                {notificationsEnabled ? (
                  <Bell className="ml-2 h-5 w-5" />
                ) : (
                  <BellOff className="ml-2 h-5 w-5" />
                )}
                <div>
                  <h3 className="text-sm font-medium">התראות</h3>
                  <p className="text-xs text-slate-500">
                    {isPWA
                      ? "קבל התראות על דייטים"
                      : "קבל התראות (מומלץ להתקין את האפליקציה)"}
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
                aria-label="Toggle notifications"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="partnerA"
                  className="text-sm font-medium text-slate-500 mb-1 block"
                >
                  שם ראשון
                </label>
                <input
                  id="partnerA"
                  type="text"
                  value={partnerA}
                  onChange={(e) => handlePartnerNameChange("A", e.target.value)}
                  className="w-full p-2 border rounded-md text-right"
                />
              </div>
              <div>
                <label
                  htmlFor="partnerB"
                  className="text-sm font-medium text-slate-500 mb-1 block"
                >
                  שם שני
                </label>
                <input
                  id="partnerB"
                  type="text"
                  value={partnerB}
                  onChange={(e) => handlePartnerNameChange("B", e.target.value)}
                  className="w-full p-2 border rounded-md text-right"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="dateDetails"
                className="text-sm font-medium text-slate-500 mb-1 block"
              >
                פרטי הדייט
              </label>
              <Textarea
                id="dateDetails"
                placeholder="מה עושים בדייט הזה?"
                value={dateDetails}
                onChange={handleDateDetailsChange}
                className="w-full p-2 border rounded-md text-right min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-500">
                  מיקום הדייט
                </Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="surpriseLocation" className="text-sm">
                    הפתעה
                  </Label>
                  <Switch
                    id="surpriseLocation"
                    checked={isSurpriseLocation}
                    onCheckedChange={(checked) => {
                      setIsSurpriseLocation(checked);
                      if (checked) {
                        setDateLocation("");
                      }
                    }}
                  />
                </div>
              </div>
              {!isSurpriseLocation && (
                <input
                  type="text"
                  value={dateLocation}
                  onChange={(e) => setDateLocation(e.target.value)}
                  placeholder="איפה נפגשים?"
                  className="w-full p-2 border rounded-md text-right"
                  disabled={isSurpriseLocation}
                />
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isPlanned ? (
            <Button
              variant="outline"
              onClick={handleMarkUnplanned}
              className="w-full"
            >
              <XCircle className="ml-2 h-4 w-4" />
              סמן כלא מתוכנן
            </Button>
          ) : (
            <Button onClick={handleMarkPlanned} className="w-full">
              <CheckCircle className="ml-2 h-4 w-4" />
              סמן כמתוכנן
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Date History Section */}
      <Card className="shadow-lg rtl">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>היסטוריית דייטים</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="p-1 h-auto"
            >
              {showHistory ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>

        {showHistory && (
          <CardContent>
            {historyWeeks.length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {historyWeeks.map((week) => (
                  <AccordionItem value={`week-${week}`} key={week}>
                    <AccordionTrigger className="py-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <span className="font-medium">שבוע {week}</span>
                          <Badge
                            variant={
                              planningHistory[week] ? "default" : "outline"
                            }
                            className={cn(
                              "mr-2",
                              planningHistory[week] &&
                                "bg-[#34C759] hover:bg-[#34C759]/90",
                              !planningHistory[week] &&
                                "bg-red-500 hover:bg-red-600 text-white border-0"
                            )}
                          >
                            {planningHistory[week] ? "מתוכנן" : "לא מתוכנן"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {getPlanner(week, partnerA, partnerB)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-slate-50 p-3 rounded-md">
                        {dateDetailsHistory[week] ? (
                          <p className="whitespace-pre-wrap">
                            {dateDetailsHistory[week]}
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            אין פרטים על דייט זה
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>אין היסטוריית דייטים עדיין</p>
                <p className="text-sm">דייטים שתתכננו יופיעו כאן</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
