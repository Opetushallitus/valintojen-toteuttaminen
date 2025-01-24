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
  luoEiHyvaksymiskirjeetPDF,
  luoHyvaksymiskirjeetPDF,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { SpinnerIcon } from '@/app/components/spinner-icon';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { LocalizedSelect } from '@/app/components/localized-select';
import { SelectChangeEvent } from '@mui/material/Select';
import { useFileDownloadMutation } from '@/app/hooks/useFileDownloadMutation';
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  styled,
} from '@mui/material';
import { FileResult } from '@/app/lib/http-client';

export type LetterTemplateModalProps = {
  title: string;
  template: KirjepohjaNimi;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
};

const CustomRadio = styled(Radio)(() => ({
  padding: 0,
  '&:first-child': {
    padding: '5px 0',
  },
}));

const CustomContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1rem',
}));

const TemplateSection = ({
  pohjat,
  templateBody,
  setTemplateBody,
  setLetterBody,
}: {
  pohjat: Kirjepohja[];
  templateBody: string;
  setTemplateBody: (val: string) => void;
  setLetterBody: (val: string) => void;
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
    </>
  );
};

const TargetRadioGroup = ({
  onlyForbidden,
  setOnlyForbidden,
}: {
  onlyForbidden: boolean;
  setOnlyForbidden: (val: boolean) => void;
}) => {
  const { t } = useTranslations();

  return (
    <OphFormControl
      label={t('kirje-modaali.kohdejoukko')}
      renderInput={({ labelId }) => (
        <RadioGroup
          aria-labelledby={labelId}
          value={onlyForbidden}
          onChange={(event) => setOnlyForbidden(event.target.value === 'true')}
        >
          <FormControlLabel
            value={false}
            control={<CustomRadio />}
            label={t('kirje-modaali.kohdejoukko-hyvaksytyt')}
          />
          <FormControlLabel
            value={true}
            control={<CustomRadio />}
            label={t('kirje-modaali.kohdejoukko-luvattomat')}
          />
        </RadioGroup>
      )}
    />
  );
};

const LettersDownloadButton = ({
  getFile,
}: {
  getFile: () => Promise<FileResult>;
}) => {
  const { t } = useTranslations();

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

export const AcceptedLetterTemplateModal = createModal(
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

    const getFile = useCallback(
      () =>
        luoHyvaksymiskirjeetPDF({
          hakukohde,
          sijoitteluajoId,
          letterBody,
          deadline: deadlineDate,
          onlyForbidden,
        }),
      [hakukohde, deadlineDate, sijoitteluajoId, letterBody, onlyForbidden],
    );

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
            <LettersDownloadButton getFile={getFile} />
          </>
        }
      >
        {isLoading && <SpinnerIcon />}
        {!isLoading && (
          <CustomContainer>
            <TargetRadioGroup
              onlyForbidden={onlyForbidden}
              setOnlyForbidden={setOnlyForbidden}
            />
            <TemplateSection
              pohjat={pohjat}
              templateBody={templateBody}
              setTemplateBody={setTemplateBody}
              setLetterBody={setLetterBody}
            />
            <CalendarComponent
              selectedValue={deadlineDate}
              setDate={setDeadlineDate}
            />
          </CustomContainer>
        )}
      </OphModalDialog>
    );
  },
);

export const NonAcceptedLetterTemplateModal = createModal(
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

    const [templateBody, setTemplateBody] = useState<string>(
      pohjat[0]?.sisalto || '',
    );
    const [letterBody, setLetterBody] = useState<string>(templateBody);

    const getFile = useCallback(
      () =>
        luoEiHyvaksymiskirjeetPDF({
          hakukohde,
          sijoitteluajoId,
          letterBody,
        }),
      [hakukohde, sijoitteluajoId, letterBody],
    );

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
            <LettersDownloadButton getFile={getFile} />
          </>
        }
      >
        {isLoading && <SpinnerIcon />}
        {!isLoading && (
          <TemplateSection
            pohjat={pohjat}
            templateBody={templateBody}
            setTemplateBody={setTemplateBody}
            setLetterBody={setLetterBody}
          />
        )}
      </OphModalDialog>
    );
  },
);
