'use client';

import { createContext, useState } from 'react';

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

  function increaseBlocked() {
    setNumberOfBlockers(Math.max(0, numberOfBlockers) + 1);
  }
  function decreaseBlocked() {
    setNumberOfBlockers(Math.max(0, numberOfBlockers - 1));
  }
  function unblock() {
    setNumberOfBlockers(0);
  }

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
