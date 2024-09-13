'use client';

import { useEffect } from 'react';
import useToaster from './useToaster';
import { useRouter } from 'next/navigation';

export default function useConfirmChangesBeforeNavigation(isDirty: boolean) {
  const { addToast } = useToaster();
  const router = useRouter();

  useEffect(() => {
    if (router.push.name !== 'patched') {
      // @ts-expect-error storing original function to the router
      router.originalPush = router.push;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        return true;
      }
    };
    if (isDirty && router.push.name !== 'patched') {
      router.push = function patched(...args) {
        addToast({
          key: 'unsaved-changes',
          message: 'lomake.tallentamaton',
          type: 'confirm',
          confirmFn: () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            // @ts-expect-error setting back original push function to router
            router.push = router.originalPush;
            router.push(...args);
          },
        });
      };
      window.addEventListener('beforeunload', onBeforeUnload);
    } else if (router.push.name === 'patched' && !isDirty) {
      window.removeEventListener('beforeunload', onBeforeUnload);
      // @ts-expect-error setting back original push function to router
      router.push = router.originalPush;
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);
}
