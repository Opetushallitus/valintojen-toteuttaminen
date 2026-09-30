import { Stack, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { isEmpty } from 'remeda';
import {
  createModal,
  useOphModalProps,
} from '@/components/modals/global-modal';
import { OphModal } from '@/components/modals/oph-modal';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { FullClientSpinner } from '@/components/client-spinner';
import { ErrorAlert } from '@/components/error-alert';
import { ExternalLink } from '@/components/external-link';
import { LabeledInfoItem } from '@/components/labeled-info-item';
import { ListTable } from '@/components/table/list-table';
import { makeColumnWithCustomRender } from '@/components/table/table-columns';
import { buildLinkToApplication } from '@/lib/ataru/ataru-service';
import { Language } from '@/lib/localization/localization-types';
import { TFunction, useTranslations } from '@/lib/localization/useTranslations';
import { ValinnanTila, VastaanottoTila } from '@/lib/types/sijoittelu-types';
import { queryOptionsGetSijoittelunVastaanottoTilat } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-queries';
import {
  HakutoiveenVastaanottoTila,
  Valintatila,
} from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-types';
import { useMemo } from 'react';

const HYVAKSYTYT_VALINTATILAT = new Set<Valintatila>([
  ValinnanTila.HYVAKSYTTY,
  ValinnanTila.HARKINNANVARAISESTI_HYVAKSYTTY,
  ValinnanTila.VARASIJALTA_HYVAKSYTTY,
]);

const isHyvaksytty = (hakutoive: HakutoiveenVastaanottoTila) =>
  HYVAKSYTYT_VALINTATILAT.has(hakutoive.valintatila);

const isKeskenTaiVaralla = (hakutoive: HakutoiveenVastaanottoTila) =>
  hakutoive.valintatila === 'KESKEN' ||
  hakutoive.valintatila === ValinnanTila.VARALLA;

// Hyväksytty, mutta odottaa ylempien hakutoiveiden tuloksia (kk-haku sijoittelulla)
const isHyvaksyttyKesken = (
  hakutoive: HakutoiveenVastaanottoTila,
  hakutoiveet: Array<HakutoiveenVastaanottoTila>,
) => {
  if (hakutoive.valintatila !== ValinnanTila.HYVAKSYTTY) {
    return false;
  }
  const firstKeskenIndex = hakutoiveet.findIndex(isKeskenTaiVaralla);
  const hakutoiveIndex = hakutoiveet.findIndex(
    (h) => h.hakukohdeOid === hakutoive.hakukohdeOid,
  );
  return (
    firstKeskenIndex !== -1 &&
    firstKeskenIndex < hakutoiveIndex &&
    hakutoive.vastaanotettavuustila === 'EI_VASTAANOTETTAVISSA'
  );
};

const VASTAANOTTOTILAT_WITH_TEXT = new Set<VastaanottoTila>([
  VastaanottoTila.VASTAANOTTANUT_SITOVASTI,
  VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
  VastaanottoTila.EHDOLLISESTI_VASTAANOTTANUT,
]);

const formatDate = (date: string) => format(new Date(date), 'd.M.yyyy');

export const getValintatilanneText = (
  hakutoive: HakutoiveenVastaanottoTila,
  hakutoiveet: Array<HakutoiveenVastaanottoTila>,
  t: TFunction,
  language: Language,
) => {
  if (VASTAANOTTOTILAT_WITH_TEXT.has(hakutoive.vastaanottotila)) {
    return t(`valintatilanne.vastaanottotila.${hakutoive.vastaanottotila}`);
  }

  const lang = language.toUpperCase() as 'FI' | 'SV' | 'EN';
  const valintatilaText = isHyvaksyttyKesken(hakutoive, hakutoiveet)
    ? t('valintatilanne.valintatila.HYVAKSYTTY_KESKEN')
    : t(`valintatilanne.valintatila.${hakutoive.valintatila}`, {
        defaultValue: hakutoive.valintatila,
      });

  if (isHyvaksytty(hakutoive) && hakutoive.ehdollisestiHyvaksyttavissa) {
    const ehto =
      hakutoive[`ehdollisenHyvaksymisenEhto${lang}`] ||
      t('valintatilanne.ehdollinen');
    return `${valintatilaText} (${ehto})`;
  }

  const tilanKuvaus = hakutoive.tilanKuvaukset?.[lang];
  if (!isEmpty(tilanKuvaus ?? '')) {
    return hakutoive.valintatila === ValinnanTila.HYLATTY
      ? `${valintatilaText} ${tilanKuvaus}`
      : tilanKuvaus;
  }

  if (hakutoive.valintatila === ValinnanTila.VARALLA) {
    return hakutoive.varasijojaTaytetaanAsti
      ? t('valintatilanne.varalla-pvm', {
          varasija: hakutoive.varasijanumero,
          varasijaPvm: formatDate(hakutoive.varasijojaTaytetaanAsti),
        })
      : t('valintatilanne.varalla', { varasija: hakutoive.varasijanumero });
  }

  return valintatilaText;
};

const ValintatilanneContent = ({
  hakuOid,
  hakemusOid,
}: {
  hakuOid: string;
  hakemusOid: string;
}) => {
  const { t, getLanguage } = useTranslations();
  const { data } = useSuspenseQuery(
    queryOptionsGetSijoittelunVastaanottoTilat({ hakuOid, hakemusOid }),
  );

  const { hakutoiveet } = data;

  const columns = useMemo(
    () => [
      makeColumnWithCustomRender<HakutoiveenVastaanottoTila>({
        title: 'valintatilanne.hakutoive',
        key: 'hakukohdeNimi',
        sortable: false,
        renderFn: (hakutoive) => (
          <span>
            {hakutoiveet.indexOf(hakutoive) + 1}. {hakutoive.tarjoajaNimi},{' '}
            {hakutoive.hakukohdeNimi}
          </span>
        ),
      }),
      makeColumnWithCustomRender<HakutoiveenVastaanottoTila>({
        title: 'valintatilanne.tila',
        key: 'valintatila',
        sortable: false,
        renderFn: (hakutoive) => (
          <Typography
            component="span"
            sx={{ fontWeight: isHyvaksytty(hakutoive) ? 600 : undefined }}
          >
            {getValintatilanneText(hakutoive, hakutoiveet, t, getLanguage())}
          </Typography>
        ),
      }),
    ],
    [hakutoiveet, t, getLanguage],
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={4}>
        <LabeledInfoItem
          label={t('valintatilanne.hakemus-oid')}
          value={
            <ExternalLink
              name={hakemusOid}
              href={buildLinkToApplication(hakemusOid)}
              noIcon={true}
            />
          }
        />
        <LabeledInfoItem
          label={t('valintatilanne.oppijanumero')}
          value={data.hakijaOid}
        />
      </Stack>
      <ListTable
        rowKeyProp="hakukohdeOid"
        columns={columns}
        rows={hakutoiveet}
      />
    </Stack>
  );
};

export const ValintatilanneGlobalModal = createModal(
  ({
    hakuOid,
    hakemusOid,
    hakijanNimi,
  }: {
    hakuOid: string;
    hakemusOid: string;
    hakijanNimi: string;
  }) => {
    const modalProps = useOphModalProps();
    const { t } = useTranslations();

    const { data } = useQuery(
      queryOptionsGetSijoittelunVastaanottoTilat({ hakuOid, hakemusOid }),
    );

    const someHakutoiveKeskenTaiVaralla =
      data?.hakutoiveet.some(isKeskenTaiVaralla);

    let valintatilaText = '';

    if (someHakutoiveKeskenTaiVaralla === true) {
      valintatilaText = ' ' + t('valintatilanne.kesken');
    } else if (someHakutoiveKeskenTaiVaralla === false) {
      valintatilaText = ' ' + t('valintatilanne.lopullinen');
    }

    const title = t('valintatilanne.otsikko') + valintatilaText;

    return (
      <OphModal
        {...modalProps}
        title={title}
        maxWidth="md"
        actions={
          <OphButton variant="outlined" onClick={modalProps.onClose}>
            {t('yleinen.sulje')}
          </OphButton>
        }
      >
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          {hakijanNimi}
        </Typography>
        <QuerySuspenseBoundary
          suspenseFallback={<FullClientSpinner />}
          errorFallbackRender={({ resetErrorBoundary }) => (
            <ErrorAlert
              title={t('valintatilanne.virhe')}
              retry={resetErrorBoundary}
            />
          )}
        >
          <ValintatilanneContent hakuOid={hakuOid} hakemusOid={hakemusOid} />
        </QuerySuspenseBoundary>
      </OphModal>
    );
  },
);
