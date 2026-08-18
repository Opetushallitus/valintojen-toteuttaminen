import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';
import { showModal } from '@/components/modals/global-modal';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useEffect } from 'react';
import { useBlocker } from 'react-router';

/**
 * Estää react-routerin navigoinnin (linkit ja selaimen edellinen/seuraava) ja
 * näyttää vahvistusmodaalin, kun lomakkeella on tallentamattomia muutoksia.
 * Sivun sulkeminen ja uudelleenlataus varmistetaan beforeunload-tapahtumalla.
 */
export function useNavigationBlockerWithWindowEvents(isDirty: boolean) {
  const { t } = useTranslations();
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      showModal(ConfirmationGlobalModal, {
        title: t('lomake.tallentamattomia-muutoksia'),
        content: t('lomake.tallentamaton'),
        confirmLabel: t('lomake.jatka'),
        cancelLabel: t('yleinen.peruuta'),
        onConfirm: () => blocker.proceed(),
        onCancel: () => blocker.reset(),
      });
    }
  }, [blocker, t]);
}
