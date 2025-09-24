"use client";
import { useEffect } from "react";
import { H } from "@highlight-run/next/client";

export default function HighlightProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    H.init("d0oevl36hees769uqvl0");
    
    // Check if user is logged in and identify them
    const checkUserSession = () => {
      // Check for session cookie (this is a simple check)
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session_user='));
      
      if (sessionCookie) {
        const userEmail = sessionCookie.split('=')[1];
        if (userEmail && userEmail !== '') {
          H.identify(userEmail);
        }
      }
    };
    
    // Identify user on initial load
    checkUserSession();
    
    // Listen for navigation changes to re-identify user
    const handleNavigation = () => {
      setTimeout(checkUserSession, 100); // Small delay to ensure cookies are updated
    };
    
    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);
  
  return <>{children}</>;
}