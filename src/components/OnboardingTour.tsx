"use client";

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useUser } from "@clerk/nextjs";

export default function OnboardingTour() {
  const { user, isLoaded } = useUser();
  const hasStarted = useRef(false);

  useEffect(() => {
    // Only run once, ensure user is loaded
    if (!isLoaded || !user) return;

    const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: false,
      overlayColor: "rgba(10, 22, 40, 0.7)",
      nextBtnText: "Next &rarr;",
      prevBtnText: "&larr; Prev",
      doneBtnText: "Done",
      progressText: "{{current}} of 10",
      onDestroyed: async () => {
        try {
          await fetch("/api/users/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hasCompletedTour: true }),
          });
        } catch (e) {
          console.error("Failed to update tour flag", e);
        }
      },
      steps: [
        {
          popover: {
            title: "🎉 Welcome to CircleWorks!",
            description: "Let us show you around your new HR & Payroll command center. It will only take a minute.",
            align: "center",
          }
        },
        {
          element: "#tour-sidebar",
          popover: {
            title: "Navigation",
            description: "This is your main navigation. Everything is one click away.",
            side: "right",
            align: "start"
          }
        },
        {
          element: "#tour-dashboard",
          popover: {
            title: "Your Command Center",
            description: "See what needs attention today, track live stats, and get real-time alerts.",
            side: "top",
            align: "start"
          }
        },
        {
          element: "#tour-payroll",
          popover: {
            title: "Payroll Made Easy",
            description: "Run payroll here. We auto-calculate all taxes for all 50 states.",
            side: "right",
            align: "start"
          }
        },
        {
          element: "#tour-employees",
          popover: {
            title: "Team Management",
            description: "All your people — add, edit, and manage docs from here.",
            side: "right",
            align: "start"
          }
        },
        {
          element: "#tour-search",
          popover: {
            title: "Universal Search",
            description: "Press Cmd+K anytime to find anything instantly.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#tour-notifications",
          popover: {
            title: "Stay Updated",
            description: "Approvals, alerts, and deadlines live here.",
            side: "bottom",
            align: "end"
          }
        },
        {
          element: "#tour-compliance",
          popover: {
            title: "Compliance Health",
            description: "Your compliance health score — we keep you out of trouble.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#tour-circe",
          popover: {
            title: "Meet Circe 🪄",
            description: "Meet Circe, your AI HR assistant. Ask anything about payroll or benefits.",
            side: "left",
            align: "end"
          }
        },
        {
          popover: {
            title: "You're all set! 🚀",
            description: "Start by adding employees or running your first payroll.<br/><br/><div style='display:flex;gap:10px;margin-top:10px;'><a href='/employees' class='w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors' style='text-decoration:none;'>Add Employees</a><a href='/payroll' class='w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors' style='text-decoration:none;'>Run First Payroll</a></div>",
            align: "center"
          }
        }
      ]
    });

    // Check flag in publicMetadata for auto-start
    const hasCompletedTour = user.publicMetadata?.hasCompletedTour === true;
    if (!hasCompletedTour && !hasStarted.current) {
      hasStarted.current = true;
      // Increased delay to ensure DOM is fully ready
      setTimeout(() => { 
        if (document.querySelector("#tour-dashboard")) {
          tourDriver.drive(); 
        } else {
          console.warn("Tour container not found, skipping auto-start");
          hasStarted.current = false; // Allow retry if DOM wasn't ready
        }
      }, 1500);
    }

    // Allow manual trigger
    const handleStartTour = () => {
      tourDriver.drive();
    };

    window.addEventListener("circleworks:start-tour", handleStartTour);
    return () => window.removeEventListener("circleworks:start-tour", handleStartTour);

  }, [isLoaded, user]);

  return null;
}
