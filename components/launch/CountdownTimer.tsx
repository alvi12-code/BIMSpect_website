"use client";

import { useEffect, useState } from "react";
import { getRemainingTime, launchTimestamp, type RemainingTime } from "@/lib/launch";

type CountdownTimerProps = {
  initialRemaining: RemainingTime;
  labels?: Record<keyof Omit<RemainingTime, "totalMs">, string>;
  ariaLabel?: string;
};

const units: Array<keyof Omit<RemainingTime, "totalMs">> = [
  "days",
  "hours",
  "minutes",
  "seconds"
];

const defaultLabels = {
  days: "days",
  hours: "hours",
  minutes: "minutes",
  seconds: "seconds"
};

function getCurrentRemaining() {
  return getRemainingTime(new Date());
}

export function CountdownTimer({
  initialRemaining,
  labels = defaultLabels,
  ariaLabel = "Time remaining until launch"
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(initialRemaining);

  useEffect(() => {
    const tick = () => {
      const nextRemaining = getCurrentRemaining();
      setRemaining(nextRemaining);

      if (nextRemaining.totalMs <= 0) {
        window.location.reload();
      }
    };
    const interval = window.setInterval(tick, 1000);

    tick();

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="launch-countdown"
      aria-label={`${ariaLabel}: ${new Date(launchTimestamp).toISOString()}`}
    >
      {units.map((unit) => (
        <div className="launch-countdown-item" key={unit}>
          <strong>{remaining[unit].toString().padStart(2, "0")}</strong>
          <span>{labels[unit]}</span>
        </div>
      ))}
    </div>
  );
}
