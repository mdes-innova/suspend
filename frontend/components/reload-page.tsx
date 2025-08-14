'use client';

import { useEffect } from 'react';

export default function ReloadPage() {
  useEffect(() => {
    if (window)
      window?.location?.reload();
  }, []);

  return null;
}
