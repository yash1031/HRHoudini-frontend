// lib/auth/sign-out.ts
import { signOut as amplifySignOut } from 'aws-amplify/auth';
import { closeWebSocket } from '@/lib/ws';
import { clearTokens } from './tokens';

/**
 * Common sign-out utility function
 * Handles WebSocket cleanup, API call, Google sign-out, and storage clearing
 * 
 * @param redirectTo - Optional redirect path after sign-out (default: '/')
 * @returns Promise that resolves when sign-out is complete
 */
export async function signOutUser(redirectTo: string = '/'): Promise<void> {
  try {
    closeWebSocket();
    const user_id = localStorage.getItem('user_id');
    const is_google_logged_in = localStorage.getItem("is-google-logged-in") === "true";

    console.log("user_id", user_id, "is_google_logged_in", is_google_logged_in)
    // Fire-and-forget request with keepalive
    await fetch('/api/auth/sign-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id, is_google: is_google_logged_in}),
      credentials: 'include',
      // keepalive: true, // Keeps request alive even after page unload
    }).catch(err => console.error('Sign-out request failed:', err));

    // Handle Google sign-out (this is fast)
    if (is_google_logged_in) {
      console.log("User is getting google signed out")
      amplifySignOut().catch(err => console.error('Google sign-out failed:', err));
    }

    console.log("Clearing localStorage and sessionStorage")
    // Clear localStorage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect
    window.location.href = redirectTo;
  } catch (error) {
    console.error('Sign out failed:', error);
    // Ensure cleanup even on error
    clearTokens();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = redirectTo;
  }
}