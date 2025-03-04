import { useTranslations } from '@/app/hooks/useTranslations';
import {
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import useToaster from '@/app/hooks/useToaster';
import { Haku, Hakukohde } from '@/app/lib/kouta/kouta-types';
import {
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { sendVastaanottopostiValintatapaJonolle } from '@/app/lib/valinta-tulos-service/valinta-tulos-service';
import { useIsHakuPublishAllowed } from '@/app/hooks/useIsHakuPublishAllowed';
import { filter, isEmpty, pipe, prop } from 'remeda';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getMyohastyneetHakemukset } from '@/app/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import { showModal } from '@/app/components/global-modal';
import { GlobalConfirmationModal } from '@/app/components/global-confirmation-modal';
import { buildLinkToApplication } from '@/app/lib/ataru/ataru-service';
import { ExternalLink } from '@/app/components/external-link';
import { useSelector } from '@xstate/react';
import {
  MassChangeParams,
  SijoittelunTuloksetEventType,
  SijoittelunTuloksetState,
  SijoittelunTulosActorRef,
} from '../lib/sijoittelun-tulokset-state';

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
}: {
  hakuOid: string;
  hakukohdeOid: string;
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
}) => {
  const hakemuksetJotkaTarvitsevatAikarajaMennytTiedon = pipe(
    hakemukset,
    filter(
      (hakemus) =>
        hakemus.vastaanottotila === VastaanottoTila.KESKEN &&
        hakemus.julkaistavissa &&
        [
          SijoittelunTila.HYVAKSYTTY,
          SijoittelunTila.VARASIJALTA_HYVAKSYTTY,
          SijoittelunTila.PERUNUT,
        ].includes(hakemus.tila),
    ),
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
  }, [] as Array<SijoittelunHakemusValintatiedoilla>);
};

const EraantyneetInfoTable = ({
  eraantyneetHakemukset,
}: {
  eraantyneetHakemukset: Array<SijoittelunHakemusValintatiedoilla>;
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
}: {
  disabled: boolean;
  hakuOid: string;
  hakukohdeOid: string;
  massUpdateForm: (params: MassChangeParams) => void;
  hakemukset: Array<SijoittelunHakemusValintatiedoilla>;
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
        showModal(GlobalConfirmationModal, {
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
              vastaanottotila: VastaanottoTila.EI_VASTAANOTETTU_MAARA_AIKANA,
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
    (s) => s.context.hakemukset,
  );

  const isPublishAllowed = useIsHakuPublishAllowed({ haku });

  return (
    <ActionsContainer>
      <OphButton
        onClick={() => {
          send({ type: SijoittelunTuloksetEventType.UPDATE });
        }}
        variant="contained"
        loading={state.matches(SijoittelunTuloksetState.UPDATING)}
        disabled={!state.matches(SijoittelunTuloksetState.IDLE)}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      <MerkitseMyohastyneeksiButton
        hakuOid={haku.oid}
        hakukohdeOid={hakukohde.oid}
        hakemukset={hakemukset}
        disabled={
          !isPublishAllowed || !state.matches(SijoittelunTuloksetState.IDLE)
        }
        massUpdateForm={(changeParams: MassChangeParams) => {
          send({
            type: SijoittelunTuloksetEventType.MASS_UPDATE,
            ...changeParams,
          });
        }}
      />
      <OphButton
        variant="contained"
        disabled={
          !isPublishAllowed || !state.matches(SijoittelunTuloksetState.IDLE)
        }
        onClick={() => {
          send({ type: SijoittelunTuloksetEventType.PUBLISH });
        }}
        loading={state.matches(SijoittelunTuloksetState.PUBLISHING)}
      >
        {t('sijoittelun-tulokset.hyvaksy')}
      </OphButton>
      <SendVastaanottopostiButton
        disabled={!state.matches(SijoittelunTuloksetState.IDLE)}
        hakukohdeOid={hakukohde.oid}
        valintatapajonoOid={valintatapajonoOid}
      />
    </ActionsContainer>
  );
};
