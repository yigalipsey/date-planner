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
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const DateHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/get-history");
      const data = await response.json();
      if (data.success && data.history) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">טוען היסטוריה...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p>אין היסטוריית דייטים עדיין</p>
        <p className="text-sm">דייטים שתתכננו יופיעו כאן</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((date) => (
        <div key={date.week} className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <Badge
              variant={date.isPlanned ? "default" : "outline"}
              className={cn(
                "px-2 py-1",
                date.isPlanned && "bg-[#34C759] hover:bg-[#34C759]/90",
                !date.isPlanned &&
                  "bg-red-500 hover:bg-red-600 text-white border-0"
              )}
            >
              {date.isPlanned ? "מתוכנן" : "לא מתוכנן"}
            </Badge>
            <span className="text-sm text-gray-500">שבוע {date.week}</span>
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium text-gray-500">פרטי הדייט</h4>
              <p className="text-base">{date.dateDetails}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">מיקום</h4>
              <p className="text-base">{date.location}</p>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                תוכנן על ידי:{" "}
                {getPlanner(date.week, date.partnerA, date.partnerB)}
              </span>
              <span>
                {new Date(date.createdAt).toLocaleDateString("he-IL")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [currentPlanner, setCurrentPlanner] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Load current week's date from database
  useEffect(() => {
    const loadCurrentDate = async () => {
      try {
        console.log("Loading date for week:", currentWeek);
        const response = await fetch(`/api/get-planner?week=${currentWeek}`);
        const data = await response.json();
        console.log("Loaded date data:", data);

        if (data.date) {
          const dateData = data.date;
          console.log("Found date data:", dateData);

          // Update all the fields from the database
          setIsPlanned(true);
          setDateDetails(dateData.dateDetails || "");
          setDateLocation(dateData.location || "");
          setIsSurpriseLocation(dateData.location === "הפתעה");

          // Update histories
          setDateDetailsHistory((prev) => ({
            ...prev,
            [currentWeek]: dateData.dateDetails,
          }));
          setPlanningHistory((prev) => ({
            ...prev,
            [currentWeek]: true,
          }));

          // Log what we're setting
          console.log("Setting state with:", {
            isPlanned: true,
            dateDetails: dateData.dateDetails,
            location: dateData.location,
            isSurpriseLocation: dateData.location === "הפתעה",
          });
        } else {
          console.log("No date found for week:", currentWeek);
          // Reset fields if no data found
          setIsPlanned(false);
          setDateDetails("");
          setDateLocation("");
          setIsSurpriseLocation(false);
        }
      } catch (error) {
        console.error("Error loading date:", error);
        // Reset fields on error
        setIsPlanned(false);
        setDateDetails("");
        setDateLocation("");
        setIsSurpriseLocation(false);
      }
    };

    loadCurrentDate();
  }, [currentWeek]);

  // Check if running as PWA
  useEffect(() => {
    const checkIsPWA = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone ||
        document.referrer.includes("android-app://")
      );
    };

    const checkIsIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    };

    setIsIOS(checkIsIOS());
    setIsPWA(checkIsPWA());
  }, []);

  const handleMarkPlanned = async () => {
    // Check if date details are empty
    if (!dateDetails.trim()) {
      setErrorMessage("חובה להזין פרטי דייט");
      return;
    }

    // Check if location is empty and not marked as surprise
    if (!isSurpriseLocation && !dateLocation.trim()) {
      setErrorMessage("חובה לבחור מיקום או לסמן כהפתעה");
      return;
    }

    try {
      setIsLoading(true);
      // Check if a date already exists for this week
      const checkResponse = await fetch(`/api/get-planner?week=${currentWeek}`);
      const checkData = await checkResponse.json();

      if (checkData.date && checkData.date.isPlanned) {
        setErrorMessage("כבר קיים דייט מתוכנן לשבוע זה");
        return;
      }

      console.log("Attempting to save date to database...");
      const dateData = {
        week: currentWeek,
        dateDetails: dateDetails,
        location: isSurpriseLocation ? "הפתעה" : dateLocation,
        isPlanned: true,
        planningDate: new Date(),
        partnerA,
        partnerB,
      };
      console.log("Date data to save:", dateData);

      // Save planner to database
      const response = await fetch("/api/save-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dateData),
      });

      console.log("Save response status:", response.status);
      const responseData = await response.json();
      console.log("Save response data:", responseData);

      if (!response.ok) {
        throw new Error(
          `Failed to save planner: ${responseData.error || "Unknown error"}`
        );
      }

      // If all validations pass, mark as planned
      setIsPlanned(true);
      setPlanningHistory((prev) => ({
        ...prev,
        [currentWeek]: true,
      }));

      // Success message
      setSuccessMessage("הדייט תוכנן בהצלחה! 🎉");
    } catch (error) {
      console.error("Error in handleMarkPlanned:", error);
      console.error("Error stack:", error.stack);
      setErrorMessage(`שגיאה בשמירת המתכנן: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkUnplanned = async () => {
    try {
      setIsCancelling(true);
      const response = await fetch("/api/save-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          week: currentWeek,
          isPlanned: false,
          dateDetails: "",
          location: "",
          partnerA,
          partnerB,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to unmark date");
      }

      // Send cancellation email
      const emailResponse = await fetch("/api/send-cancellation-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          week: currentWeek,
          partnerA,
          partnerB,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send cancellation email");
      }

      setIsPlanned(false);
      setDateDetails("");
      setDateLocation("");
      setIsSurpriseLocation(false);
      setSuccessMessage("הדייט בוטל בהצלחה");
    } catch (error) {
      console.error("Error unmarking date:", error);
      setErrorMessage("שגיאה בביטול הדייט");
    } finally {
      setIsCancelling(false);
    }
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

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    setShowCancelDialog(false);
    await handleMarkUnplanned();
  };

  return (
    <>
      <div className="container mx-auto p-4 max-w-2xl rtl">
        {/* Error Message */}
        {errorMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative rtl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-600">שגיאה!</h3>
                <button
                  onClick={() => setErrorMessage("")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-700 text-lg mb-6">{errorMessage}</p>
              <Button
                onClick={() => setErrorMessage("")}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                הבנתי
              </Button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative rtl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-green-600">הצלחה!</h3>
                <button
                  onClick={() => setSuccessMessage("")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-700 text-lg mb-6">{successMessage}</p>
              <Button
                onClick={() => setSuccessMessage("")}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                אישור
              </Button>
            </div>
          </div>
        )}

        <Card className="shadow-lg rtl mb-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className="ml-2 h-4 w-4" />
                <span>שבוע {currentWeek}</span>
              </div>
              <Badge
                variant={isPlanned ? "default" : "outline"}
                className={cn(
                  "mr-2 px-4 py-1.5 text-base font-medium",
                  isPlanned && "bg-[#34C759] hover:bg-[#34C759]/90",
                  !isPlanned &&
                    "bg-red-500 hover:bg-red-600 text-white border-0"
                )}
              >
                {isPlanned ? "מתוכנן" : "לא מתוכנן"}
              </Badge>
            </div>
            <CardDescription>
              <div className="flex items-center mt-2">
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
                  dir="rtl"
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
                    dir="rtl"
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
                onClick={handleCancelClick}
                className="w-full disabled:opacity-100 disabled:cursor-not-allowed"
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <div className="flex items-center justify-center">
                    <Loader />
                  </div>
                ) : (
                  <>
                    <XCircle className="ml-2 h-4 w-4" />
                    בטל דייט
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleMarkPlanned}
                className="w-full disabled:opacity-100 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader />
                  </div>
                ) : (
                  <>
                    <CheckCircle className="ml-2 h-4 w-4" />
                    סמן כמתוכנן
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Date History Section */}
        <Card className="shadow-lg rtl">
          <CardHeader className="pb-2">
            <CardTitle className="flex pb-4 justify-between items-center">
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
              <DateHistory />
            </CardContent>
          )}
        </Card>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[425px] rtl">
          <DialogHeader className="text-center space-y-2 pb-2">
            <DialogTitle className="text-center text-lg">
              ביטול דייט
            </DialogTitle>
            <DialogDescription className="text-center">
              האם את/ה בטוח/ה שברצונך לבטל את הדייט?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center gap-2 sm:justify-center pt-2">
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <div className="flex items-center justify-center">
                  <Loader />
                </div>
              ) : (
                <>אני בטוח/ה</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              ביטול
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}
