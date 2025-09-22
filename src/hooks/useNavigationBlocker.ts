import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';
import { showModal } from '@/components/modals/global-modal';
import { NavigationBlockerContext } from '@/components/providers/navigation-blocker-provider';
import { useTranslations } from '@/lib/localization/useTranslations';
import { use, useEffect } from 'react';

export function useNavigationBlocker() {
  return use(NavigationBlockerContext);
}

export function useNavigationBlockerWithWindowEvents(isDirty: boolean) {
  const { setIsBlocked } = useNavigationBlocker();
  const { t } = useTranslations();

  useEffect(() => {
    setIsBlocked(isDirty);
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    const handleBackButton = (event: PopStateEvent) => {
      if (isDirty) {
        event.preventDefault();

        showModal(ConfirmationGlobalModal, {
          title: t('lomake.tallentamattomia-muutoksia'),
          content: t('lomake.tallentamaton'),
          confirmLabel: t('lomake.jatka'),
          cancelLabel: t('yleinen.peruuta'),
          onConfirm: () => {
            setIsBlocked(false);
            window.removeEventListener('popstate', handleBackButton);
            window.history.back();
          },
        });
      }
    };
    window.addEventListener('popstate', handleBackButton);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isDirty, setIsBlocked, t]);
}
