"use client";
import { useEffect, useRef } from "react";
import { H } from "@highlight-run/next/client";

export default function HighlightProvider({ children }: { children: React.ReactNode }) {
  const lastIdentifiedUser = useRef<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (!isInitialized.current) {
      try {
        H.init("d0oevl36hees769uqvl0");
        isInitialized.current = true;
        console.log('✅ Highlight.io initialized');
      } catch (error) {
        console.warn('⚠️ Highlight.io initialization failed:', error);
        // Don't break the app if Highlight.io fails to initialize
        return;
      }
    }
    
    // Check if user is logged in and identify them
    const checkUserSession = () => {
      try {
        // Check for session cookie (this is a simple check)
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session_user='));
        
        if (sessionCookie) {
          const userEmail = decodeURIComponent(sessionCookie.split('=')[1]);
          // Validate email format and ensure it's not empty
          if (userEmail && 
              userEmail !== '' && 
              userEmail !== 'undefined' && 
              userEmail !== 'null' &&
              userEmail.includes('@') &&
              userEmail !== lastIdentifiedUser.current) {
            // Only identify if this is a different user than last time
            H.identify(userEmail, {
              email: userEmail,
              // Add minimal user properties to avoid session data conflicts
            });
            lastIdentifiedUser.current = userEmail;
            console.log('✅ Highlight.io user identified:', userEmail);
          }
        } else if (lastIdentifiedUser.current !== null) {
          // User logged out - clear the last identified user
          lastIdentifiedUser.current = null;
          console.log('🔄 Highlight.io user session cleared');
        }
      } catch (error) {
        console.warn('⚠️ Highlight.io session check failed:', error);
        // Don't break the app if Highlight.io has issues
      }
    };
    
    // Identify user on initial load and when component mounts
    checkUserSession();
    
    // Optional: Listen for storage events if you want to detect login/logout in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_session_changed') {
        checkUserSession();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array - only run once
  
  return <>{children}</>;
}