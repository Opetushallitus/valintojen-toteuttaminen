'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { showModal } from '@/components/modals/global-modal';
import { useTranslations } from '@/lib/localization/useTranslations';
import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';

const onBeforeUnload = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  return true;
};

const restoreOriginalPush = (router: AppRouterInstance) => {
  window.removeEventListener('beforeunload', onBeforeUnload);
  // @ts-expect-error setting back original push function to router
  router.push = router.originalPush;
};

export function useConfirmChangesBeforeNavigation(isDirty: boolean) {
  const router = useRouter();

  const { t } = useTranslations();

  useEffect(() => {
    if (router.push.name !== 'patched') {
      // @ts-expect-error storing original push function to the router
      router.originalPush = router.push;
    }

    if (isDirty && router.push.name !== 'patched') {
      router.push = function patched(...args) {
        showModal(ConfirmationGlobalModal, {
          title: t('lomake.tallentamattomia-muutoksia'),
          content: t('lomake.tallentamaton'),
          confirmLabel: t('lomake.jatka'),
          cancelLabel: t('yleinen.peruuta'),
          onConfirm: () => {
            restoreOriginalPush(router);
            router.push(...args);
          },
        });
      };
      window.addEventListener('beforeunload', onBeforeUnload);
    } else if (router.push.name === 'patched' && !isDirty) {
      restoreOriginalPush(router);
    }

    return () => {
      restoreOriginalPush(router);
    };
  }, [isDirty, router, t]);
}
