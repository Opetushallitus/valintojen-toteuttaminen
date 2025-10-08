import { useTranslations } from '@/lib/localization/useTranslations';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Haku, Hakukohde, KoutaOidParams } from '@/lib/kouta/kouta-types';
import {
  ValinnanTila,
  SijoittelunTulosActorRef,
  VastaanottoTila,
} from '@/lib/types/sijoittelu-types';
import { isEmpty, prop } from 'remeda';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  getValinnanTulosExcel,
  getMyohastyneetHakemukset,
} from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { showModal } from '@/components/modals/global-modal';
import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';
import { buildLinkToApplication } from '@/lib/ataru/ataru-service';
import { ExternalLink } from '@/components/external-link';
import { useSelector } from '@xstate/react';
import { styled } from '@/lib/theme';
import { useIsValintaesitysJulkaistavissa } from '@/hooks/useIsValintaesitysJulkaistavissa';
import { ValinnanTulosActorRef } from '@/lib/state/createValinnanTuloksetMachine';
import { HakemuksenValinnanTulos } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { FileDownloadButton } from './file-download-button';
import { useSendVastaanottoPostiMutation } from '@/hooks/useSendVastaanottoPostiMutation';
import {
  ValinnanTulosEventType,
  ValinnanTulosMassChangeParams,
  ValinnanTulosState,
} from '@/lib/state/valinnanTuloksetMachineTypes';
import { useHasOnlyHakukohdeReadPermission } from '@/hooks/useHasOnlyHakukohdeReadPermission';

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  width: '100%',
  flexWrap: 'wrap',
}));

const SendVastaanottopostiButton = ({
  disabled,
  hakukohdeOid,
  valintatapajonoOid,
  mode,
}: {
  disabled: boolean;
  hakukohdeOid: string;
  valintatapajonoOid?: string;
  mode: 'sijoittelu' | 'valinta';
}) => {
  const { t } = useTranslations();

  const { isPending, mutate } = useSendVastaanottoPostiMutation({
    target: mode === 'sijoittelu' ? 'valintatapajono' : 'hakukohde',
    hakukohdeOid,
    valintatapajonoOid,
  });

  return (
    <OphButton
      variant="contained"
      disabled={disabled}
      onClick={() => mutate()}
      loading={isPending}
    >
      {mode === 'sijoittelu'
        ? t('vastaanottoposti.valintatapajono-laheta')
        : t('vastaanottoposti.hakukohde-laheta')}
    </OphButton>
  );
};

export const ValinnanTuloksetExcelDownloadButton = ({
  haku,
  hakukohdeOid,
  valintatapajonoOid,
}: {
  haku: Haku;
  hakukohdeOid: string;
  valintatapajonoOid?: string;
}) => {
  const { t } = useTranslations();

  return (
    <FileDownloadButton
      variant="contained"
      defaultFileName={`valinnantulos-${hakukohdeOid}.xlsx`}
      errorKey="get-valinnan-tulos-excel"
      errorMessage="valinnan-tulokset.virhe-vie-taulukkolaskentaan"
      disabled={!valintatapajonoOid}
      getFile={() =>
        getValinnanTulosExcel({
          haku,
          hakukohdeOid,
          valintatapajonoOid,
        })
      }
    >
      {t('yleinen.vie-taulukkolaskentaan')}
    </FileDownloadButton>
  );
};

const useEraantyneetHakemukset = ({
  hakuOid,
  hakukohdeOid,
  hakemukset,
}: KoutaOidParams & {
  hakemukset: Array<HakemuksenValinnanTulos>;
}) => {
  const hakemuksetJotkaTarvitsevatAikarajaMennytTiedon = hakemukset.filter(
    (hakemus) =>
      hakemus?.vastaanottoTila === VastaanottoTila.KESKEN &&
      hakemus?.julkaistavissa &&
      [
        ValinnanTila.HYVAKSYTTY,
        ValinnanTila.VARASIJALTA_HYVAKSYTTY,
        ValinnanTila.PERUNUT,
      ].includes(hakemus.valinnanTila as ValinnanTila),
  );

  const hakemusOids = hakemuksetJotkaTarvitsevatAikarajaMennytTiedon.map(
    prop('hakemusOid'),
  );

  const { data: myohastyneetHakemukset = [] } = useSuspenseQuery({
    queryKey: ['getMyohastyneetHakemukset', hakuOid, hakukohdeOid, hakemusOids],
    queryFn: () =>
      getMyohastyneetHakemukset({
        hakuOid,
        hakukohdeOid,
        hakemusOids,
      }),
  });

  return myohastyneetHakemukset?.reduce((result, eraantynytHakemus) => {
    const hakemus = hakemuksetJotkaTarvitsevatAikarajaMennytTiedon?.find(
      (h) => h.hakemusOid === eraantynytHakemus.hakemusOid,
    );

    return hakemus && eraantynytHakemus?.mennyt ? [...result, hakemus] : result;
  }, [] as Array<HakemuksenValinnanTulos>);
};

const EraantyneetInfoTable = ({
  eraantyneetHakemukset,
}: {
  eraantyneetHakemukset: Array<HakemuksenValinnanTulos>;
}) => {
  const { t } = useTranslations();
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('sijoittelun-tulokset.hakija')}</TableCell>
            <TableCell>{t('sijoittelun-tulokset.hakemus-oid')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {eraantyneetHakemukset.map((h) => (
            <TableRow key={h.hakemusOid}>
              <TableCell>{h.hakijanNimi}</TableCell>
              <TableCell>
                <ExternalLink
                  name={h.hakemusOid}
                  href={
                    h.hakemusOid ? buildLinkToApplication(h?.hakemusOid) : ''
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const MerkitseMyohastyneeksiButton = ({
  hakuOid,
  hakukohdeOid,
  disabled,
  massUpdateForm,
  hakemukset,
}: KoutaOidParams & {
  disabled: boolean;
  massUpdateForm: (params: ValinnanTulosMassChangeParams) => void;
  hakemukset: Array<HakemuksenValinnanTulos>;
}) => {
  const { t } = useTranslations();

  const eraantyneetHakemukset = useEraantyneetHakemukset({
    hakuOid,
    hakukohdeOid,
    hakemukset,
  });

  return (
    <OphButton
      variant="contained"
      disabled={disabled || isEmpty(eraantyneetHakemukset ?? [])}
      onClick={() =>
        showModal(ConfirmationGlobalModal, {
          title: t('sijoittelun-tulokset.merkitse-myohastyneeksi-modal-title'),
          maxWidth: 'md',
          content: (
            <Box>
              <OphTypography>
                {t('sijoittelun-tulokset.merkitse-myohastyneeksi-modal-text')}
              </OphTypography>
              <EraantyneetInfoTable
                eraantyneetHakemukset={eraantyneetHakemukset}
              />
            </Box>
          ),
          confirmLabel: t('sijoittelun-tulokset.merkitse-myohastyneeksi'),
          cancelLabel: t('yleinen.peruuta'),
          onConfirm: () => {
            massUpdateForm({
              vastaanottoTila: VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
              hakemusOids: new Set(
                eraantyneetHakemukset.map(prop('hakemusOid')),
              ),
            });
          },
        })
      }
    >
      {t('sijoittelun-tulokset.merkitse-myohastyneeksi')}
    </OphButton>
  );
};

export const ValinnanTuloksetActions = ({
  haku,
  hakukohde,
  valinnanTulosActorRef,
  mode,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  valinnanTulosActorRef: ValinnanTulosActorRef | SijoittelunTulosActorRef;
  mode: 'sijoittelu' | 'valinta';
}) => {
  const { t } = useTranslations();

  const { send } = valinnanTulosActorRef;

  const { state, hakemukset, valintatapajonoOid } = useSelector(
    valinnanTulosActorRef,
    (s) => ({
      state: s,
      hakemukset: s.context.hakemukset,
      valintatapajonoOid: s.context.valintatapajonoOid,
    }),
  );

  const isValintaesitysJulkaistavissa = useIsValintaesitysJulkaistavissa({
    haku,
  });

  const userHasOnlyReadPermission = useHasOnlyHakukohdeReadPermission();

  return userHasOnlyReadPermission ? null : (
    <ActionsContainer>
      <OphButton
        onClick={() => {
          send({ type: ValinnanTulosEventType.UPDATE });
        }}
        variant="contained"
        loading={state.matches(ValinnanTulosState.UPDATING)}
        disabled={!state.matches(ValinnanTulosState.IDLE)}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      {mode === 'valinta' && (
        <ValinnanTuloksetExcelDownloadButton
          haku={haku}
          hakukohdeOid={hakukohde.oid}
          valintatapajonoOid={valintatapajonoOid}
        />
      )}
      <MerkitseMyohastyneeksiButton
        hakuOid={haku.oid}
        hakukohdeOid={hakukohde.oid}
        hakemukset={hakemukset}
        disabled={
          !isValintaesitysJulkaistavissa ||
          !state.matches(ValinnanTulosState.IDLE)
        }
        massUpdateForm={(changeParams: ValinnanTulosMassChangeParams) => {
          send({
            type: ValinnanTulosEventType.MASS_UPDATE,
            ...changeParams,
          });
        }}
      />
      <OphButton
        variant="contained"
        disabled={
          mode !== 'valinta' &&
          (!isValintaesitysJulkaistavissa ||
            !state.matches(ValinnanTulosState.IDLE))
        }
        onClick={() => {
          send({ type: ValinnanTulosEventType.PUBLISH });
        }}
        loading={state.matches(ValinnanTulosState.PUBLISHING)}
      >
        {t('sijoittelun-tulokset.hyvaksy')}
      </OphButton>
      <SendVastaanottopostiButton
        disabled={!state.matches(ValinnanTulosState.IDLE)}
        hakukohdeOid={hakukohde.oid}
        mode={mode}
        valintatapajonoOid={valintatapajonoOid}
      />
    </ActionsContainer>
  );
};
