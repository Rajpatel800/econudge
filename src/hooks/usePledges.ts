"use client";

import { useState, useEffect } from "react";

export interface Pledge {
  id: string;
  label: string;
  days: number;
  progress: number;
  message: string;
  lastCheckedIn: string | null;
}

const DEFAULT_PLEDGES: Pledge[] = [];

export function usePledges() {
  const [pledges, setPledges] = useState<Pledge[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("econudge_pledges");
      if (saved) {
        setPledges(JSON.parse(saved));
      } else {
        setPledges(DEFAULT_PLEDGES);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const addPledge = (label: string, message: string) => {
    const newPledge: Pledge = {
      id: Date.now().toString(),
      label,
      days: 1,
      progress: 5, // Just starting
      message,
      lastCheckedIn: new Date().toDateString(), // Checked in on day 1
    };
    
    setPledges((prev) => {
      const updated = [newPledge, ...prev];
      localStorage.setItem("econudge_pledges", JSON.stringify(updated));
      window.dispatchEvent(new Event("pledges_updated"));
      return updated;
    });
  };

  const incrementPledge = (id: string) => {
    const today = new Date().toDateString();
    
    setPledges((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          // Prevent multiple check-ins on the same day
          if (p.lastCheckedIn === today) return p;
          
          const newDays = p.days + 1;
          return { 
            ...p, 
            days: newDays, 
            progress: Math.min(100, p.progress + 5),
            lastCheckedIn: today
          };
        }
        return p;
      });
      localStorage.setItem("econudge_pledges", JSON.stringify(updated));
      return updated;
    });
  };

  // Listen for cross-component updates
  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem("econudge_pledges");
      if (saved) setPledges(JSON.parse(saved));
    };
    window.addEventListener("pledges_updated", handleUpdate);
    return () => window.removeEventListener("pledges_updated", handleUpdate);
  }, []);

  return { pledges, addPledge, incrementPledge };
}
