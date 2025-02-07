import { useTranslations } from '@/app/hooks/useTranslations';
import {
  OphButton,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import { useState } from 'react';
import { CalendarComponent } from '@/app/components/calendar-component';
import { KirjepohjaNimi } from '@/app/lib/types/valintalaskentakoostepalvelu-types';
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
import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { ProgressModalDialog } from './progress-modal-dialog';
import { styled } from '@/app/lib/theme';
import { TemplateSection } from './letter-template-section';

export type LetterTemplateModalProps = {
  title: string;
  template: KirjepohjaNimi;
  hakukohde: Hakukohde;
  sijoitteluajoId: string;
  hakemusOids?: Array<string>;
  setDocument?: (docId: string) => void;
  korkeaKoulu?: boolean;
};

const CustomRadio = styled(Radio)(({ theme }) => ({
  padding: 0,
  '&:first-child': {
    padding: `${theme.spacing(0.3)} 0`,
  },
}));

const CustomContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.spacing(2),
}));

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

    const mutation = useMutation({
      onError: (e) => {
        console.error(e);
      },
      mutationFn: async () =>
        await luoHyvaksymiskirjeetPDF({
          hakukohde,
          sijoitteluajoId,
          letterBody,
          deadline: deadlineDate,
          onlyForbidden,
          hakemusOids,
        }),
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
    korkeaKoulu = false,
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

    const mutation = useMutation({
      onError: (e) => {
        console.error(e);
      },
      mutationFn: async () =>
        await luoEiHyvaksymiskirjeetPDF({
          hakukohde,
          sijoitteluajoId,
          letterBody,
        }),
    });

    const mutationStarted =
      mutation.isPending || mutation.isError || mutation.isSuccess;

    return mutationStarted ? (
      <ProgressModalDialog
        progressMessage="kirje-modaali.kirjeet-muodostetaan"
        defaultFileName={
          korkeaKoulu
            ? 'ei-hyvaksyttyjen-kirjeet.pdf'
            : 'jalkiohjauskirjeet.pdf'
        }
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
          <CustomContainer>
            <TemplateSection
              pohjat={pohjat}
              templateBody={templateBody}
              setTemplateBody={setTemplateBody}
              setLetterBody={setLetterBody}
            />
          </CustomContainer>
        )}
      </OphModalDialog>
    );
  },
);
