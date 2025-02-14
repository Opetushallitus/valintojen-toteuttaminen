import { useTranslations } from '@/app/hooks/useTranslations';
import {
  Box,
  CircularProgress,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { AnyMachineSnapshot } from 'xstate';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { SijoittelunTuloksetStates } from '../lib/sijoittelun-tulokset-state';
import useToaster from '@/app/hooks/useToaster';
import { Haku, Hakukohde } from '@/app/lib/types/kouta-types';
import {
  SijoitteluajonValintatapajonoValintatiedoilla,
  SijoittelunHakemusValintatiedoilla,
  SijoittelunTila,
  VastaanottoTila,
} from '@/app/lib/types/sijoittelu-types';
import { sendVastaanottopostiValintatapaJonolle } from '@/app/lib/valinta-tulos-service';
import { useIsHakuPublishAllowed } from '@/app/hooks/useIsHakuPublishAllowed';
import { filter, isEmpty, pipe, prop } from 'remeda';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getMyohastyneetHakemukset } from '@/app/lib/valintalaskentakoostepalvelu';
import { showModal } from '@/app/components/global-modal';
import { GlobalConfirmationModal } from '@/app/components/global-confirmation-modal';
import { buildLinkToApplication } from '@/app/lib/ataru';
import { ExternalLink } from '@/app/components/external-link';

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
  valintatapajono,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
}) => {
  // TODO: Vain tämän jonon hakemukset
  const hakemuksetJotkaTarvitsetvatAikarajaMennytTiedon = pipe(
    valintatapajono.hakemukset,
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

  const { data: eraantyneetHakemukset = [] } = useSuspenseQuery({
    queryKey: ['getMyohastyneetHakemukset', hakuOid, hakukohdeOid],
    queryFn: () =>
      getMyohastyneetHakemukset({
        hakuOid,
        hakukohdeOid,
        hakemusOids: hakemuksetJotkaTarvitsetvatAikarajaMennytTiedon.map(
          prop('hakemusOid'),
        ),
      }),
  });

  return eraantyneetHakemukset?.reduce((acc, eraantynytHakemus) => {
    const hakemus = hakemuksetJotkaTarvitsetvatAikarajaMennytTiedon?.find(
      (h) => h.hakemusOid === eraantynytHakemus.hakemusOid,
    );

    if (hakemus) {
      return [
        ...acc,
        {
          ...hakemus,
          myohastynyt: Boolean(eraantynytHakemus?.mennyt),
          vastaanottoDeadline: eraantynytHakemus?.vastaanottoDeadline,
        },
      ];
    } else {
      return acc;
    }
  }, [] as EraantyneetHakemukset);
};

type EraantyneetHakemukset = Array<
  SijoittelunHakemusValintatiedoilla & {
    myohastynyt: boolean;
    vastaanottoDeadline: string;
  }
>;

const EraantyneetInfoTable = ({
  eraantyneetHakemukset,
}: {
  eraantyneetHakemukset: EraantyneetHakemukset;
}) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Hakijan Nimi</TableCell>
            <TableCell>Hakemus OID</TableCell>
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
  valintatapajono,
  disabled,
}: {
  disabled: boolean;
  hakuOid: string;
  hakukohdeOid: string;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
}) => {
  const { t } = useTranslations();

  const eraantyneetHakemukset = useEraantyneetHakemukset({
    hakuOid,
    hakukohdeOid,
    valintatapajono,
  });

  return (
    <OphButton
      variant="contained"
      disabled={disabled || isEmpty(eraantyneetHakemukset ?? [])}
      onClick={() =>
        showModal(GlobalConfirmationModal, {
          title: t('sijoittelun-tulokset.merkitse-myohastyneeksi-modal-title'),
          maxWidth: 'md',
          text: (
            <Box>
              <OphTypography>
                {t('sijoittelun-tulokset.merkitse-myohastyneeksi-modal-text')}
              </OphTypography>
              <EraantyneetInfoTable
                eraantyneetHakemukset={eraantyneetHakemukset}
              />
            </Box>
          ),
        })
      }
    >
      {t('sijoittelun-tulokset.merkitse-myohastyneeksi')}
    </OphButton>
  );
};

export const SijoittelunTuloksetActions = ({
  haku,
  state,
  publish,
  hakukohde,
  valintatapajono,
}: {
  haku: Haku;
  state: AnyMachineSnapshot;
  publish: () => void;
  hakukohde: Hakukohde;
  valintatapajono: SijoitteluajonValintatapajonoValintatiedoilla;
}) => {
  const { t } = useTranslations();

  const isPublishAllowed = useIsHakuPublishAllowed({ haku });

  return (
    <ActionsContainer>
      <OphButton
        type="submit"
        variant="contained"
        disabled={!state.matches(SijoittelunTuloksetStates.IDLE)}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      {state.matches(SijoittelunTuloksetStates.UPDATING) && (
        <CircularProgress aria-label={t('yleinen.paivitetaan')} />
      )}
      <MerkitseMyohastyneeksiButton
        hakuOid={haku.oid}
        hakukohdeOid={hakukohde.oid}
        valintatapajono={valintatapajono}
        disabled={!isPublishAllowed}
      />
      <OphButton
        variant="contained"
        disabled={
          !isPublishAllowed || !state.matches(SijoittelunTuloksetStates.IDLE)
        }
        onClick={publish}
      >
        {t('sijoittelun-tulokset.hyvaksy')}
      </OphButton>
      {state.matches(SijoittelunTuloksetStates.PUBLISHING) && (
        <CircularProgress aria-label={t('yleinen.paivitetaan')} />
      )}
      <SendVastaanottopostiButton
        disabled={!state.matches(SijoittelunTuloksetStates.IDLE)}
        hakukohdeOid={hakukohde.oid}
        valintatapajonoOid={valintatapajono.oid}
      />
    </ActionsContainer>
  );
};
