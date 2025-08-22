import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const session = localStorage.getItem('session');
    if (session) {
      const parsedSession = JSON.parse(session);
      return parsedSession.access_token;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }

  return null;
}
