import { useTranslations } from '@/app/hooks/useTranslations';
import {
  OphButton,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
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
import {
  useMutation,
  UseMutationResult,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  getKirjepohjatHakukohteelle,
  luoEiHyvaksymiskirjeetPDF,
  luoHyvaksymiskirjeetPDF,
} from '@/app/lib/valintalaskentakoostepalvelu';
import { SpinnerIcon } from '@/app/components/spinner-icon';
import { LocalizedSelect } from '@/app/components/localized-select';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  styled,
} from '@mui/material';
import { ProgressModalDialog } from './progress-modal-dialog';

export type LetterTemplateModalProps = {
  title: string;
  template: KirjepohjaNimi;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  hakemusOids?: Array<string>;
  setDocument?: (docId: string) => void;
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
      <OphFormFieldWrapper
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
    <OphFormFieldWrapper
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
  mutation,
  singleLetter = false,
}: {
  mutation: UseMutationResult<string, Error, void, unknown>;
  singleLetter?: boolean;
}) => {
  const { t } = useTranslations();

  return (
    <OphButton
      variant="contained"
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {t(
        singleLetter
          ? 'kirje-modaali.muodosta-kirje'
          : 'kirje-modaali.muodosta',
      )}
    </OphButton>
  );
};

export const AcceptedLetterTemplateModal = createModal(
  ({
    hakukohde,
    title,
    template,
    sijoitteluajoId,
    hakemusOids,
    setDocument,
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
          hakemusOids,
        }),
      [
        hakukohde,
        deadlineDate,
        sijoitteluajoId,
        letterBody,
        onlyForbidden,
        hakemusOids,
      ],
    );

    const mutation = useMutation({
      onError: (e) => {
        console.error(e);
      },
      mutationFn: async () => await getFile(),
      onSuccess: (data) => {
        if (setDocument) {
          setDocument(data);
        }
      },
    });

    const mutationStarted =
      mutation.isPending || mutation.isError || mutation.isSuccess;
    const defaultFileName =
      hakemusOids?.length === 1
        ? 'hyvaksymiskirje.pdf'
        : 'hyvaksymiskirjeet.pdf';
    const progressMessage =
      hakemusOids?.length === 1
        ? 'kirje-modaali.kirje-muodostetaan'
        : 'kirje-modaali.kirjeet-muodostetaan';

    return mutationStarted ? (
      <ProgressModalDialog
        progressMessage={progressMessage}
        defaultFileName={defaultFileName}
        title={title}
        mutation={mutation}
      />
    ) : (
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
              singleLetter={hakemusOids && hakemusOids.length === 1}
              mutation={mutation}
            />
          </>
        }
      >
        {isLoading && <SpinnerIcon />}
        {!isLoading && (
          <CustomContainer>
            {(!hakemusOids || hakemusOids.length !== 1) && (
              <TargetRadioGroup
                onlyForbidden={onlyForbidden}
                setOnlyForbidden={setOnlyForbidden}
              />
            )}
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

    const mutation = useMutation({
      onError: (e) => {
        console.error(e);
      },
      mutationFn: async () => await getFile(),
    });

    const mutationStarted =
      mutation.isPending || mutation.isError || mutation.isSuccess;

    return mutationStarted ? (
      <ProgressModalDialog
        progressMessage="kirje-modaali.kirjeet-muodostetaan"
        defaultFileName="ei-hyvaksyttyjen-kirjeet.pdf"
        title={title}
        mutation={mutation}
      />
    ) : (
      <OphModalDialog
        {...modalProps}
        title={t(title)}
        maxWidth="md"
        actions={
          <>
            <OphButton variant="outlined" onClick={modalProps.onClose}>
              {t('yleinen.peruuta')}
            </OphButton>
            <LettersDownloadButton mutation={mutation} />
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
