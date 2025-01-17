import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useState } from 'react';
import { CalendarComponent } from './calendar-component';
import { EditorComponent } from './editor-component';
import { Kirjepohja, KirjepohjaNimi } from '@/app/lib/types/valintalaskentakoostepalvelu-types';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getKirjepohjatHakukohteelle } from '@/app/lib/valintalaskentakoostepalvelu';
import { SpinnerIcon } from '@/app/components/spinner-icon';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';
import { SelectChangeEvent } from '@mui/material/Select';

export type LetterTemplateModalProps = {
  title: string,
  template: KirjepohjaNimi,
  hakukohde: Hakukohde,
}

const TemplateModalContent = ({template, hakukohde}: Omit<LetterTemplateModalProps, 'title'>) => {

  const { data: pohjat, isLoading } = useSuspenseQuery({
    queryKey: [
      'getKirjepohjat',
      hakukohde.hakuOid,
      template,
      hakukohde.oid,
    ],
    queryFn: () => getKirjepohjatHakukohteelle(template, hakukohde)
  });

  const { t } = useTranslations();

  const [usedPohja, setUsedPohja] = useState<Kirjepohja>(pohjat[0]);
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [templateBody, setTemplateBody] = useState<string>(usedPohja?.sisalto || "aaaa");

  const changeUsedPohja = (event: SelectChangeEvent<string>) => {
    const pohja = pohjat.find(p => p.nimi === event.target.value)!;
    setUsedPohja(pohja);
    setTemplateBody(pohja?.sisalto || "");
  }

  return isLoading? <SpinnerIcon />
  : (
    <>
      <OphFormControl
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
        }}
        label={t('sijoittelun-tulokset.taulukko.tila')}
        renderInput={({ labelId }) => (
          <LocalizedSelect
            id="kirjepohja-select"
            labelId={labelId}
            value={usedPohja?.nimi || ''}
            onChange={changeUsedPohja}
            options={pohjat.map(p => 
              ({value: p.nimi, label: t(`kirjepohja.${p.nimi}`, p.nimi)}))}
            clearable
          />
        )}
      />
      <EditorComponent editorContent={templateBody} setContentChanged={setTemplateBody}/>
      <CalendarComponent selectedValue={deadlineDate} setDate={setDeadlineDate} />
    </>
  );
};

export const LetterTemplateModal = createModal(
  ({hakukohde, title, template}: LetterTemplateModalProps) => {

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
        {}
        <TemplateModalContent hakukohde={hakukohde} template={template}/>
      </OphModalDialog>
    );
  },
);
