import { useEffect, useState } from 'react';

export const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: forces a client-only re-render after mount
    setHasMounted(true);
  }, []);
  return hasMounted ? children : null;
};
