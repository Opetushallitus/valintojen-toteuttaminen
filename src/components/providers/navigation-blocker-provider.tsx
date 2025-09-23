'use client';

import { createContext, useCallback, useState } from 'react';

interface NavigationBlockerContextType {
  isBlocked: boolean;
  unblock: () => void;
  increaseBlocked: () => void;
  decreaseBlocked: () => void;
}

export const NavigationBlockerContext =
  createContext<NavigationBlockerContextType>({
    isBlocked: false,
    unblock: () => {},
    increaseBlocked: () => {},
    decreaseBlocked: () => {},
  });

export function NavigationBlockerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [numberOfBlockers, setNumberOfBlockers] = useState(0);

  const increaseBlocked = useCallback(() => {
    setNumberOfBlockers((oldCount) => Math.max(0, oldCount) + 1);
  }, [setNumberOfBlockers]);

  const decreaseBlocked = useCallback(() => {
    setNumberOfBlockers((oldCount) => Math.max(0, oldCount - 1));
  }, [setNumberOfBlockers]);

  const unblock = useCallback(() => {
    setNumberOfBlockers(0);
  }, [setNumberOfBlockers]);

  return (
    <NavigationBlockerContext.Provider
      value={{
        isBlocked: numberOfBlockers > 0,
        increaseBlocked,
        decreaseBlocked,
        unblock,
      }}
    >
      {children}
    </NavigationBlockerContext.Provider>
  );
}
