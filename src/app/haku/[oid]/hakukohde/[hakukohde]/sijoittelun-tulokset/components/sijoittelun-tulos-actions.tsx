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
import useToaster from '@/hooks/useToaster';
import { Haku, Hakukohde, KoutaOidParams } from '@/lib/kouta/kouta-types';
import { SijoittelunTila, VastaanottoTila } from '@/lib/types/sijoittelu-types';
import { sendVastaanottopostiValintatapaJonolle } from '@/lib/valinta-tulos-service/valinta-tulos-service';
import { isEmpty, prop } from 'remeda';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getMyohastyneetHakemukset } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { showModal } from '@/components/modals/global-modal';
import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';
import { buildLinkToApplication } from '@/lib/ataru/ataru-service';
import { ExternalLink } from '@/components/external-link';
import { useSelector } from '@xstate/react';
import { styled } from '@/lib/theme';
import { useIsValintaesitysJulkaistavissa } from '@/hooks/useIsValintaesitysJulkaistavissa';
import {
  ValinnanTulosMassChangeParams,
  ValinnanTulosEventType,
  ValinnanTulosState,
} from '@/lib/state/valinnan-tulos-machine';
import { ValinnanTulosFields } from '@/lib/valinta-tulos-service/valinta-tulos-types';
import { SijoittelunTulosActorRef } from '../lib/sijoittelun-tulokset-state';

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const SendVastaanottopostiButton = ({
  disabled,
  hakukohdeOid,
  valintatapajonoOid,
}: {
  disabled: boolean;
  hakukohdeOid: string;
  valintatapajonoOid: string;
}) => {
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const sendVastaanottoposti = async () => {
    try {
      const data = await sendVastaanottopostiValintatapaJonolle(
        hakukohdeOid,
        valintatapajonoOid,
      );
      if (!data || data.length < 1) {
        addToast({
          key: 'vastaanottoposti-valintatapajono-empty',
          message:
            'sijoittelun-tulokset.toiminnot.vastaanottoposti-jonolle-ei-lahetettavia',
          type: 'error',
        });
      } else {
        addToast({
          key: 'vastaanottoposti-valintatapajonos',
          message:
            'sijoittelun-tulokset.toiminnot.vastaanottoposti-jonolle-lahetetty',
          type: 'success',
        });
      }
    } catch (e) {
      addToast({
        key: 'vastaanottoposti-valintatapajono-virhe',
        message:
          'sijoittelun-tulokset.toiminnot.vastaanottoposti-jonolle-virhe',
        type: 'error',
      });
      console.error(e);
    }
  };

  return (
    <OphButton
      variant="contained"
      disabled={disabled}
      onClick={sendVastaanottoposti}
    >
      {t('sijoittelun-tulokset.toiminnot.laheta-vastaanottoposti-jonolle')}
    </OphButton>
  );
};

const useEraantyneetHakemukset = ({
  hakuOid,
  hakukohdeOid,
  hakemukset,
}: KoutaOidParams & {
  hakemukset: Array<ValinnanTulosFields>;
}) => {
  const hakemuksetJotkaTarvitsevatAikarajaMennytTiedon = hakemukset.filter(
    (hakemus) =>
      hakemus?.vastaanottoTila === VastaanottoTila.KESKEN &&
      hakemus?.julkaistavissa &&
      [
        SijoittelunTila.HYVAKSYTTY,
        SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
        SijoittelunTila.PERUNUT,
      ].includes(hakemus.valinnanTila as SijoittelunTila),
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
  }, [] as Array<ValinnanTulosFields>);
};

const EraantyneetInfoTable = ({
  eraantyneetHakemukset,
}: {
  eraantyneetHakemukset: Array<ValinnanTulosFields>;
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
  hakemukset: Array<ValinnanTulosFields>;
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

export const SijoittelunTuloksetActions = ({
  haku,
  hakukohde,
  valintatapajonoOid,
  sijoittelunTulosActorRef,
}: {
  haku: Haku;
  hakukohde: Hakukohde;
  valintatapajonoOid: string;
  sijoittelunTulosActorRef: SijoittelunTulosActorRef;
}) => {
  const { t } = useTranslations();

  const { send } = sijoittelunTulosActorRef;

  const state = useSelector(sijoittelunTulosActorRef, (s) => s);

  const hakemukset = useSelector(
    sijoittelunTulosActorRef,
    (s) => s.context.tulokset,
  );

  const isValintaesitysJulkaistavissa = useIsValintaesitysJulkaistavissa({
    haku,
  });

  return (
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
          !isValintaesitysJulkaistavissa ||
          !state.matches(ValinnanTulosState.IDLE)
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
        valintatapajonoOid={valintatapajonoOid}
      />
    </ActionsContainer>
  );
};
