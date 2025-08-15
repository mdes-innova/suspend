'use client';

import { useEffect } from 'react';

export default function ReloadPage() {
  useEffect(() => {
    if (window) {
      const relativeUrl = 
        window.location.pathname + 
        window.location.search + 
        window.location.hash;

      const encodedUrl = encodeURIComponent(relativeUrl);

      window.location.href = `/login?pathname=${encodedUrl}`;
    }
  }, []);

  return null;
}


export function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const relativeUrl = 
    window.location.pathname + 
    window.location.search + 
    window.location.hash;

  const encodedUrl = encodeURIComponent(relativeUrl);

  window.location.href = `/login?pathname=${encodedUrl}`;
}