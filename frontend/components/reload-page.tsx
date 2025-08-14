'use client';

import { useEffect } from 'react';

export default function ReloadPage() {
  useEffect(() => {
    window.location.reload();
  }, []);

  return null;
}
