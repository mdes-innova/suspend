'use client';

import { useEffect } from 'react';
import { useAppSelector } from './store/hooks';
import { RootState } from './store';

export default function ReloadPage() {
  const user = useAppSelector((state: RootState) => state.userAuth.user);
  useEffect(() => {
    if (window) {
      if (!user) window.location.href = `/login`;
      else {
        const relativeUrl = 
          window.location.pathname + 
          window.location.search + 
          window.location.hash;

        const encodedUrl = encodeURIComponent(relativeUrl);

        window.location.href = `/login?pathname=${encodedUrl}`;
      }
    }
  }, []);

  return null;
}


export function RedirectToLogin() {
  const user = useAppSelector((state: RootState) => state.userAuth.user);
  if (typeof window === 'undefined') return;
  if (!user) window.location.href = `/login`;
  else {
    const relativeUrl = 
      window.location.pathname + 
      window.location.search + 
      window.location.hash;

    const encodedUrl = encodeURIComponent(relativeUrl);

    window.location.href = `/login?pathname=${encodedUrl}`;
  }
  return null;
}