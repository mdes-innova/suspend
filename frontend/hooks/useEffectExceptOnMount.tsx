'use client';

import { useEffect, useRef } from "react";

export function useEffectExceptOnMount(effect: () => void | (() => void), deps: any[]) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}