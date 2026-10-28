import { ClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { NDASH } from '@/lib/constants';
import { useTranslations } from '@/lib/localization/useTranslations';
import { queryOptionsGetValintatapajononAktiivisetJarjestyskriteerit } from '@/lib/valintaperusteet/valintaperusteet-queries';
import { buildLinkToJarjestyskriteeri } from '@/lib/valintaperusteet/valintaperusteet-service';
import { useSuspenseQuery } from '@tanstack/react-query';
import { JononSijainti } from '../lib/valintalaskentahistoriaUtils';

type JarjestyskriteeriLinkProps = {
  valintatapajonoOid: string;
  jononSijainti: JononSijainti;
  // Järjestyskriteerin indeksi prioriteettijärjestyksessä
  index: number;
};

const JarjestyskriteeriLinkContent = ({
  valintatapajonoOid,
  jononSijainti,
  index,
}: JarjestyskriteeriLinkProps) => {
  const { t } = useTranslations();
  const { data: jarjestyskriteerit } = useSuspenseQuery(
    queryOptionsGetValintatapajononAktiivisetJarjestyskriteerit(
      valintatapajonoOid,
    ),
  );
  // Historiat ja aktiiviset järjestyskriteerit ovat samassa prioriteettijärjestyksessä.
  // Huom: linkki vie valintaperusteiden nykyiseen järjestyskriteeriin, joka on voinut muuttua laskennan jälkeen.
  const jarjestyskriteeri = jarjestyskriteerit[index];

  return jarjestyskriteeri ? (
    <ExternalLink
      name={t('valintalaskentahistoria.valintaperusteen-mallinnus')}
      href={buildLinkToJarjestyskriteeri({
        ...jononSijainti,
        valintatapajonoOid,
        jarjestyskriteeriOid: jarjestyskriteeri.oid,
      })}
    />
  ) : (
    NDASH
  );
};

// Linkki järjestyskriteerin mallinnukseen valintaperusteissa. Laskennan tuloksiin ei tallennu
// järjestyskriteerin OIDia, joten se haetaan valintatapajonon aktiivisista järjestyskriteereistä.
export const JarjestyskriteeriLink = (props: JarjestyskriteeriLinkProps) => {
  const { t } = useTranslations();
  return (
    <QuerySuspenseBoundary
      suspenseFallback={<ClientSpinner size={16} />}
      errorFallbackRender={() =>
        t('valintalaskentahistoria.linkin-muodostus-epaonnistui')
      }
    >
      <JarjestyskriteeriLinkContent {...props} />
    </QuerySuspenseBoundary>
  );
};
