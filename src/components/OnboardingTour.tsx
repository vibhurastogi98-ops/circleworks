"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Joyride, STATUS, type EventData, type Step } from "react-joyride";

const TOUR_STORAGE_KEY = "tour_completed";

export default function OnboardingTour() {
  const [run, setRun] = useState(false);

  const steps = useMemo<Step[]>(
    () => [
      {
        target: "#tour-sidebar",
        title: "Sidebar intro",
        content: "Your modules live here. Jump between payroll, people, compliance, reports, and settings without losing context.",
        placement: "right",
      },
      {
        target: "#tour-run-payroll",
        title: "Run payroll",
        content: "Admins can start payroll from anywhere. When payroll is processing, this becomes a live status indicator.",
        placement: "bottom",
      },
      {
        target: "#tour-notifications",
        title: "Notifications",
        content: "Approvals, compliance deadlines, payroll events, and system alerts collect here.",
        placement: "bottom",
      },
      {
        target: "#tour-search",
        title: "Global search",
        content: "Click here or press Cmd+K to find employees, reports, documents, and quick actions.",
        placement: "bottom",
      },
      {
        target: "#tour-profile",
        title: "Your profile",
        content: "Open your account menu for profile settings, company settings, billing, and logout.",
        placement: "bottom-end",
      },
    ],
    [],
  );

  const completeTour = useCallback(() => {
    window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setRun(false);
  }, []);

  useEffect(() => {
    const startTour = () => {
      window.setTimeout(() => setRun(true), 300);
    };

    window.addEventListener("circleworks:start-tour", startTour);

    if (window.localStorage.getItem(TOUR_STORAGE_KEY) !== "true") {
      startTour();
    }

    return () => window.removeEventListener("circleworks:start-tour", startTour);
  }, []);

  const handleTourEvent = useCallback(
    (data: EventData) => {
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        completeTour();
      }
    },
    [completeTour],
  );

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      scrollToFirstStep
      onEvent={handleTourEvent}
      options={{
        overlayColor: "rgba(15, 23, 42, 0.62)",
        primaryColor: "#2563eb",
        spotlightPadding: 8,
        spotlightRadius: 8,
        width: 360,
        zIndex: 10020,
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Done",
        next: "Next",
        skip: "Skip",
      }}
    />
  );
}
