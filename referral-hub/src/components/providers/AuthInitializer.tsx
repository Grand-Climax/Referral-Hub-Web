"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/redux/slices/authSlice";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

/**
 * AuthInitializer
 * 
 * This component restores the auth state from the JWT token on page load.
 * It runs once when the app mounts and checks if there's a valid access token.
 * If found, it decodes the token and restores the user data to Redux.
 */
export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check if we have an access token
    const token = Cookies.get("access_token");
    
    if (token) {
      try {
        // Decode the JWT token
        const decoded: any = jwtDecode(token);
        
        // Restore user data to Redux
        dispatch(
          setUser({
            user: {
              role: decoded.role,
              hospitalId: decoded.hosp_id,
              departmentId: decoded.dept_id,
            },
          })
        );
        
        console.log("✅ Auth state restored from JWT token");
      } catch (error) {
        console.error("Failed to restore auth state:", error);
        // If token is invalid, remove it
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
      }
    }
  }, [dispatch]);

  // This component doesn't render anything
  return null;
}
