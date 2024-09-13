'use client';
/* eslint-disable*/
import { useEffect } from 'react';
import useToaster from './useToaster';
import { useRouter } from 'next/navigation';

export default function useConfirmChangesBeforeNavigation(isDirty: boolean) {
  const { addToast } = useToaster();
  const router = useRouter();

  useEffect(() => {
    if (router.push.name !== 'patched') {
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
        //addToast({key: 'unsaved-changes', message: 'lomake', type: 'success'});
        addToast({
          key: 'unsaved-changes',
          message: 'lomake.tallentamaton',
          type: 'confirm',
          confirmFn: () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            router.push = router.originalPush;
            router.push(...args);
          },
        });
      };
      window.addEventListener('beforeunload', onBeforeUnload);
    } else if (router.push.name === 'patched' && !isDirty) {
      window.removeEventListener('beforeunload', onBeforeUnload);
      router.push = router.originalPush;
    }
  }, [isDirty]);
}
