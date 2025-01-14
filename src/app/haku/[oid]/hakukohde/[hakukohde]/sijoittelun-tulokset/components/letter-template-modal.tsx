import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useState } from 'react';
import { CalendarComponent } from './calendar-component';

const TemplateModalContent = () => {
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);

  return (
    <CalendarComponent selectedValue={deadlineDate} setDate={setDeadlineDate} />
  );
};

export const LetterTemplateModal = createModal(
  ({ title }: { title: string }) => {
    const modalProps = useOphModalProps();

    const { t } = useTranslations();

    return (
      <OphModalDialog
        {...modalProps}
        title={t(title)}
        maxWidth="md"
        actions={
          <OphButton variant="outlined" onClick={modalProps.onClose}>
            {t('yleinen.sulje')}
          </OphButton>
        }
      >
        <TemplateModalContent />
      </OphModalDialog>
    );
  },
);
