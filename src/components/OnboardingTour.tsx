"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { driver } from "driver.js";
import type { DriveStep, Driver, PopoverDOM } from "driver.js";
import "driver.js/dist/driver.css";

type MeResponse = {
  profile?: {
    hasCompletedTour?: boolean;
  };
};

const TOTAL_STEPS = 10;

function stepDescription(stepNumber: number, description: string) {
  return `
    <div class="cw-tour-progress">${stepNumber} of ${TOTAL_STEPS}</div>
    <div>${description}</div>
  `;
}

function enhancePopover(popover: PopoverDOM, tourDriver: Driver, markComplete: () => void) {
  popover.wrapper.classList.add("cw-tour-popover");
  popover.closeButton.setAttribute("aria-label", "Skip tour");

  if (!popover.wrapper.querySelector(".cw-tour-skip")) {
    const skipButton = document.createElement("button");
    skipButton.type = "button";
    skipButton.className = "cw-tour-skip";
    skipButton.textContent = "Skip tour";
    skipButton.addEventListener("click", () => {
      markComplete();
      tourDriver.destroy();
    });
    popover.footer.insertBefore(skipButton, popover.footerButtons);
  }

  popover.wrapper.querySelectorAll<HTMLAnchorElement>("[data-tour-complete]").forEach((link) => {
    link.addEventListener("click", () => markComplete(), { once: true });
  });
}

export default function OnboardingTour() {
  const [showWelcome, setShowWelcome] = useState(false);
  const hasStarted = useRef(false);
  const hasMarkedComplete = useRef(false);
  const tourRef = useRef<Driver | null>(null);

  const markComplete = useCallback(async () => {
    if (hasMarkedComplete.current) return;
    hasMarkedComplete.current = true;

    try {
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasCompletedTour: true }),
      });
    } catch (error) {
      console.error("Failed to update tour flag", error);
    }
  }, []);

  const steps = useMemo<DriveStep[]>(
    () => [
      {
        element: "#tour-sidebar",
        popover: {
          title: "Main navigation",
          description: stepDescription(2, "This is your main navigation. Everything is one click away."),
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-dashboard",
        popover: {
          title: "Dashboard",
          description: stepDescription(3, "Your command center - see what needs attention today."),
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-payroll",
        popover: {
          title: "Payroll",
          description: stepDescription(4, "Run payroll here. We auto-calculate all taxes for all 50 states."),
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-employees",
        popover: {
          title: "Employees",
          description: stepDescription(5, "All your people - add, edit, manage from here."),
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-search",
        popover: {
          title: "Global search",
          description: stepDescription(6, "Press Cmd+K anytime to find anything instantly."),
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#tour-notifications",
        popover: {
          title: "Notifications",
          description: stepDescription(7, "Approvals, alerts, and deadlines live here."),
          side: "bottom",
          align: "end",
        },
      },
      {
        element: "#tour-compliance",
        popover: {
          title: "Compliance badge",
          description: stepDescription(8, "Your compliance health score - we keep you out of trouble."),
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#tour-circe",
        popover: {
          title: "Circe AI",
          description: stepDescription(9, "Meet Circe, your AI HR assistant. Ask anything."),
          side: "left",
          align: "end",
        },
      },
      {
        popover: {
          title: "You're all set!",
          description: stepDescription(
            10,
            "Start by adding employees or running your first payroll.<div class='cw-tour-ctas'><a href='/employees/new' data-tour-complete='true'>Add Employees</a><a href='/payroll/run' data-tour-complete='true'>Run First Payroll</a></div>",
          ),
          align: "center",
          doneBtnText: "Done",
        },
      },
    ],
    [],
  );

  const startTour = useCallback(() => {
    if (typeof document === "undefined") return;

    setShowWelcome(false);
    hasStarted.current = true;

    const tourDriver = driver({
      steps,
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "rgba(10, 22, 40, 0.7)",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      progressText: "{{current}} of {{total}}",
      stagePadding: 8,
      stageRadius: 8,
      onPopoverRender: (popover, { driver: activeDriver }) => {
        enhancePopover(popover, activeDriver, markComplete);
      },
      onDestroyed: () => {
        markComplete();
      },
    });

    tourRef.current = tourDriver;
    window.setTimeout(() => tourDriver.drive(), 250);
  }, [markComplete, steps]);

  const skipTour = useCallback(() => {
    setShowWelcome(false);
    markComplete();
  }, [markComplete]);

  useEffect(() => {
    const startFromHelp = () => {
      hasStarted.current = false;
      hasMarkedComplete.current = false;
      setShowWelcome(true);
    };

    window.addEventListener("circleworks:start-tour", startFromHelp);

    const shouldStartFromDashboard = window.sessionStorage.getItem("circleworks:start-tour-on-dashboard") === "true";
    if (shouldStartFromDashboard) {
      window.sessionStorage.removeItem("circleworks:start-tour-on-dashboard");
      startFromHelp();
      return () => window.removeEventListener("circleworks:start-tour", startFromHelp);
    }

    let cancelled = false;

    const loadTourStatus = async () => {
      try {
        const response = await fetch("/api/users/me", { credentials: "include" });
        if (!response.ok) return;

        const data = (await response.json()) as MeResponse;
        if (!cancelled && data.profile?.hasCompletedTour === false && !hasStarted.current) {
          setShowWelcome(true);
        }
      } catch (error) {
        console.error("Failed to load tour status", error);
      }
    };

    loadTourStatus();

    return () => {
      cancelled = true;
      window.removeEventListener("circleworks:start-tour", startFromHelp);
      tourRef.current?.destroy();
    };
  }, []);

  if (!showWelcome) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">1 of 10</p>
        <h2 className="mt-4 text-3xl font-black text-slate-950 dark:text-white">Welcome to CircleWorks!</h2>
        <p className="mt-3 text-[15px] leading-7 text-slate-600 dark:text-slate-300">
          Let us show you around.
        </p>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={skipTour}
            className="rounded-full px-5 py-3 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={startTour}
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
          >
            Start tour
          </button>
        </div>
      </div>
    </div>
  );
}
