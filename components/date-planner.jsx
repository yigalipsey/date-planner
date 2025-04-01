"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, XCircle, ChevronDown, ChevronUp, Clock, Bell, BellOff } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

// Get the current week number
const getCurrentWeek = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 604800000 // milliseconds in a week
  return Math.ceil(diff / oneWeek)
}

// Determine who's planning based on week number
const getPlanner = (weekNumber, partnerA, partnerB) => {
  return weekNumber % 2 === 0 ? partnerA : partnerB
}

export function DatePlanner() {
  const [partnerA, setPartnerA] = useState("יגאל")
  const [partnerB, setPartnerB] = useState("טלי")
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek())
  const [isPlanned, setIsPlanned] = useState(false)
  const [dateDetails, setDateDetails] = useState("")
  const [planningHistory, setPlanningHistory] = useState({})
  const [dateDetailsHistory, setDateDetailsHistory] = useState({})
  const [showHistory, setShowHistory] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState("default")
  const { toast } = useToast()

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("datePlanningHistory")
    const savedPartnerA = localStorage.getItem("partnerA")
    const savedPartnerB = localStorage.getItem("partnerB")
    const savedDateDetailsHistory = localStorage.getItem("dateDetailsHistory")
    const savedNotificationsEnabled = localStorage.getItem("notificationsEnabled")

    if (savedHistory) {
      setPlanningHistory(JSON.parse(savedHistory))
    }

    if (savedPartnerA) {
      setPartnerA(savedPartnerA)
    }

    if (savedPartnerB) {
      setPartnerB(savedPartnerB)
    }

    if (savedDateDetailsHistory) {
      setDateDetailsHistory(JSON.parse(savedDateDetailsHistory))
    }

    if (savedNotificationsEnabled) {
      setNotificationsEnabled(JSON.parse(savedNotificationsEnabled))
    }

    // Check if current week is already planned and load date details
    if (savedHistory) {
      const history = JSON.parse(savedHistory)
      setIsPlanned(!!history[currentWeek])
    }

    if (savedDateDetailsHistory) {
      const detailsHistory = JSON.parse(savedDateDetailsHistory)
      if (detailsHistory[currentWeek]) {
        setDateDetails(detailsHistory[currentWeek])
      } else {
        setDateDetails("")
      }
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [currentWeek])

  // Save planning history to localStorage
  useEffect(() => {
    localStorage.setItem("datePlanningHistory", JSON.stringify(planningHistory))
  }, [planningHistory])

  // Save date details history to localStorage
  useEffect(() => {
    localStorage.setItem("dateDetailsHistory", JSON.stringify(dateDetailsHistory))
  }, [dateDetailsHistory])

  // Save partner names to localStorage
  useEffect(() => {
    localStorage.setItem("partnerA", partnerA)
    localStorage.setItem("partnerB", partnerB)
  }, [partnerA, partnerB])

  // Save notifications setting to localStorage
  useEffect(() => {
    localStorage.setItem("notificationsEnabled", JSON.stringify(notificationsEnabled))
  }, [notificationsEnabled])

  // Handle notifications
  useEffect(() => {
    // Check if we need to show a notification based on last notification time
    const checkAndShowNotification = () => {
      if (!notificationsEnabled || notificationPermission !== "granted") return

      const lastNotificationTime = localStorage.getItem("lastNotificationTime")
      const now = new Date().getTime()

      // If no previous notification or it's been more than 3 days
      if (!lastNotificationTime || now - Number.parseInt(lastNotificationTime) > 3 * 24 * 60 * 60 * 1000) {
        const currentPlanner = getPlanner(currentWeek, partnerA, partnerB)

        if (isPlanned) {
          // Date is planned, show a reminder
          showNotification(
            "תזכורת לדייט",
            `יש לכם דייט מתוכנן השבוע! ${dateDetails ? `\n${dateDetails.substring(0, 50)}${dateDetails.length > 50 ? "..." : ""}` : ""}`,
          )
        } else {
          // Date is not planned, remind the planner
          showNotification("תזכורת לתכנון דייט", `${currentPlanner}, זה התור שלך לתכנן את הדייט השבועי!`)
        }

        // Update last notification time
        localStorage.setItem("lastNotificationTime", now.toString())
      }
    }

    // Check when the component mounts
    checkAndShowNotification()

    // Set up a check every time the app is focused
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndShowNotification()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [notificationsEnabled, notificationPermission, isPlanned, dateDetails, currentWeek, partnerA, partnerB])

  const showNotification = (title, body) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return
    }

    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: body,
        icon: "/icons/android-chrome-192x192.png",
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "שגיאה",
        description: "הדפדפן שלך לא תומך בהתראות",
        variant: "destructive",
      })
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === "granted") {
        setNotificationsEnabled(true)
        toast({
          title: "התראות הופעלו",
          description: "תקבל תזכורות על דייטים כל שלושה ימים",
        })

        // Show a test notification
        showNotification("התראות הופעלו בהצלחה", "תקבל תזכורות על דייטים כל שלושה ימים")
      } else {
        toast({
          title: "התראות לא הופעלו",
          description: "אנא אשר התראות בדפדפן כדי לקבל תזכורות",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בבקשת הרשאות להתראות",
        variant: "destructive",
      })
    }
  }

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      // Turn off notifications
      setNotificationsEnabled(false)
      toast({
        title: "התראות כבויות",
        description: "לא תקבל יותר תזכורות על דייטים",
      })
    } else {
      // Turn on notifications
      if (notificationPermission === "granted") {
        setNotificationsEnabled(true)
        toast({
          title: "התראות הופעלו",
          description: "תקבל תזכורות על דייטים כל שלושה ימים",
        })
      } else {
        await requestNotificationPermission()
      }
    }
  }

  const currentPlanner = getPlanner(currentWeek, partnerA, partnerB)

  const handleMarkPlanned = () => {
    setIsPlanned(true)
    setPlanningHistory((prev) => ({
      ...prev,
      [currentWeek]: true,
    }))
  }

  const handleMarkUnplanned = () => {
    setIsPlanned(false)
    setPlanningHistory((prev) => ({
      ...prev,
      [currentWeek]: false,
    }))
  }

  const handlePartnerNameChange = (partner, name) => {
    if (partner === "A") {
      setPartnerA(name)
    } else {
      setPartnerB(name)
    }
  }

  const handleDateDetailsChange = (e) => {
    const newDetails = e.target.value
    setDateDetails(newDetails)
    setDateDetailsHistory((prev) => ({
      ...prev,
      [currentWeek]: newDetails,
    }))
  }

  // Get history weeks (all weeks that have either planning status or date details)
  const getHistoryWeeks = () => {
    const weeks = new Set()

    // Add weeks from planning history
    Object.keys(planningHistory).forEach((week) => {
      weeks.add(Number.parseInt(week))
    })

    // Add weeks from date details history
    Object.keys(dateDetailsHistory).forEach((week) => {
      weeks.add(Number.parseInt(week))
    })

    // Convert to array, sort in descending order (newest first), and filter out current week
    return Array.from(weeks)
      .filter((week) => week !== currentWeek)
      .sort((a, b) => b - a)
  }

  const historyWeeks = getHistoryWeeks()

  return (
    <>
      <Card className="shadow-lg rtl mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>שבוע {currentWeek}</CardTitle>
            <Badge variant={isPlanned ? "default" : "outline"} className="mr-2">
              {isPlanned ? "מתוכנן" : "לא מתוכנן"}
            </Badge>
          </div>
          <CardDescription>
            <div className="flex items-center mt-2">
              <Calendar className="ml-2 h-4 w-4" />
              <span>{new Date().toLocaleDateString("he-IL", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500 mb-1">מתכנן/ת השבוע</h3>
              <p className="text-xl font-bold">{currentPlanner}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="partnerA" className="text-sm font-medium text-slate-500 mb-1 block">
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
                <label htmlFor="partnerB" className="text-sm font-medium text-slate-500 mb-1 block">
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
              <label htmlFor="dateDetails" className="text-sm font-medium text-slate-500 mb-1 block">
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

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center">
                {notificationsEnabled ? <Bell className="ml-2 h-5 w-5" /> : <BellOff className="ml-2 h-5 w-5" />}
                <div>
                  <h3 className="text-sm font-medium">התראות</h3>
                  <p className="text-xs text-slate-500">קבל תזכורות כל 3 ימים</p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
                aria-label="Toggle notifications"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isPlanned ? (
            <Button variant="outline" onClick={handleMarkUnplanned} className="w-full">
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
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="p-1 h-auto">
              {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
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
                          <Badge variant={planningHistory[week] ? "default" : "outline"} className="mr-2">
                            {planningHistory[week] ? "מתוכנן" : "לא מתוכנן"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{getPlanner(week, partnerA, partnerB)}</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-slate-50 p-3 rounded-md">
                        {dateDetailsHistory[week] ? (
                          <p className="whitespace-pre-wrap">{dateDetailsHistory[week]}</p>
                        ) : (
                          <p className="text-muted-foreground text-sm">אין פרטים על דייט זה</p>
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
    </>
  )
}

