import { useTranslations } from '@/app/hooks/useTranslations';
import { OphButton } from '@opetushallitus/oph-design-system';
import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useCallback, useState } from 'react';
import { CalendarComponent } from './calendar-component';
import { EditorComponent } from './editor-component';
import {
  Kirjepohja,
  KirjepohjaNimi,
} from '@/app/lib/types/valintalaskentakoostepalvelu-types';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  getKirjepohjatHakukohteelle,
  luoHyvaksymiskirjeetPDF,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { SpinnerIcon } from '@/app/components/spinner-icon';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';
import { SelectChangeEvent } from '@mui/material/Select';
import { useFileDownloadMutation } from '@/app/hooks/useFileDownloadMutation';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

export type LetterTemplateModalProps = {
  title: string;
  template: KirjepohjaNimi;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
};

const TemplateModalContent = ({
  pohjat,
  templateBody,
  setTemplateBody,
  setLetterBody,
  deadlineDate,
  setDeadlineDate,
  onlyForbidden,
  setOnlyForbidden,
}: {
  pohjat: Kirjepohja[];
  templateBody: string;
  setTemplateBody: (val: string) => void;
  setLetterBody: (val: string) => void;
  deadlineDate: Date | null;
  setDeadlineDate: (date: Date | null) => void;
  onlyForbidden: boolean;
  setOnlyForbidden: (val: boolean) => void;
}) => {
  const { t } = useTranslations();
  const [usedPohja, setUsedPohja] = useState<Kirjepohja>(pohjat[0]);

  const changeUsedPohja = (event: SelectChangeEvent<string>) => {
    const pohja = pohjat.find((p) => p.nimi === event.target.value)!;
    setUsedPohja(pohja);
    setTemplateBody(pohja?.sisalto || '');
  };

  return (
    <>
      <OphFormControl
        label={t('kirje-modaali.kohdejoukko')}
        renderInput={({ labelId }) => (
          <RadioGroup
            aria-labelledby={labelId}
            value={onlyForbidden}
            onChange={(event) =>
              setOnlyForbidden(event.target.value === 'true')
            }
          >
            <FormControlLabel
              value={false}
              control={<Radio />}
              label={t('kirje-modaali.kohdejoukko-hyvaksytyt')}
            />
            <FormControlLabel
              value={true}
              control={<Radio />}
              label={t('kirje-modaali.kohdejoukko-luvattomat')}
            />
          </RadioGroup>
        )}
      />
      <OphFormControl
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
        }}
        label={t('kirje-modaali.valmispohja')}
        renderInput={({ labelId }) => (
          <LocalizedSelect
            id="kirjepohja-select"
            labelId={labelId}
            value={usedPohja?.nimi || ''}
            onChange={changeUsedPohja}
            options={pohjat.map((p) => ({
              value: p.nimi,
              label: t(`kirjepohja.${p.nimi}`, p.nimi),
            }))}
            clearable
          />
        )}
      />
      <EditorComponent
        editorContent={templateBody}
        setContentChanged={setLetterBody}
      />
      <CalendarComponent
        selectedValue={deadlineDate}
        setDate={setDeadlineDate}
      />
    </>
  );
};

type DownloadButtonProps = {
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  letterBody: string;
  deadline: Date | null;
  onlyForbidden: boolean;
};

const LettersDownloadButton = ({
  hakukohde,
  sijoitteluajoId,
  letterBody,
  deadline,
  onlyForbidden,
}: DownloadButtonProps) => {
  const { t } = useTranslations();
  const getFile = useCallback(
    () =>
      luoHyvaksymiskirjeetPDF({
        hakukohde,
        sijoitteluajoId,
        letterBody,
        deadline,
        onlyForbidden,
      }),
    [hakukohde, deadline, sijoitteluajoId, letterBody, onlyForbidden],
  );

  const mutation = useFileDownloadMutation({
    onError: (e) => {
      console.error(e);
    },
    getFile,
    defaultFileName: 'kirjeet.pdf',
  });

  return (
    <OphButton
      variant="contained"
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {t('kirje-modaali.muodosta')}
    </OphButton>
  );
};

export const LetterTemplateModal = createModal(
  ({
    hakukohde,
    title,
    template,
    sijoitteluajoId,
  }: LetterTemplateModalProps) => {
    const modalProps = useOphModalProps();

    const { t } = useTranslations();

    const { data: pohjat, isLoading } = useSuspenseQuery({
      queryKey: ['getKirjepohjat', hakukohde.hakuOid, template, hakukohde.oid],
      queryFn: () => getKirjepohjatHakukohteelle(template, hakukohde),
    });

    const [onlyForbidden, setOnlyForbidden] = useState<boolean>(false);
    const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
    const [templateBody, setTemplateBody] = useState<string>(
      pohjat[0]?.sisalto || '',
    );
    const [letterBody, setLetterBody] = useState<string>(templateBody);

    return (
      <OphModalDialog
        {...modalProps}
        title={t(title)}
        maxWidth="md"
        actions={
          <>
            <OphButton variant="outlined" onClick={modalProps.onClose}>
              {t('yleinen.peruuta')}
            </OphButton>
            <LettersDownloadButton
              deadline={deadlineDate}
              hakukohde={hakukohde}
              letterBody={letterBody}
              sijoitteluajoId={sijoitteluajoId}
              onlyForbidden={onlyForbidden}
            />
          </>
        }
      >
        {isLoading && <SpinnerIcon />}
        {!isLoading && (
          <TemplateModalContent
            pohjat={pohjat}
            setLetterBody={setLetterBody}
            templateBody={templateBody}
            setTemplateBody={setTemplateBody}
            deadlineDate={deadlineDate}
            setDeadlineDate={setDeadlineDate}
            onlyForbidden={onlyForbidden}
            setOnlyForbidden={setOnlyForbidden}
          />
        )}
      </OphModalDialog>
    );
  },
);
