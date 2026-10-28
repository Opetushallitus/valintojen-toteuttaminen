import { ClientSpinner } from '@/components/client-spinner';
import { ExternalLink } from '@/components/external-link';
import { InfoTooltipButton } from '@/components/info-tooltip-button';
import { QuerySuspenseBoundary } from '@/components/query-suspense-boundary';
import { useTranslations } from '@/lib/localization/useTranslations';
import { JarjestyskriteeriModel } from '@/lib/types/laskenta-types';
import {
  queryOptionsGetLaskentakaava,
  queryOptionsGetValintatapajononJarjestyskriteerit,
} from '@/lib/valintaperusteet/valintaperusteet-queries';
import {
  buildLinkToJarjestyskriteeri,
  buildLinkToValintatapajono,
} from '@/lib/externalLinks';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import {
  JononSijainti,
  TOOLTIP_MAX_WIDTH,
} from '../lib/valintalaskentahistoriaUtils';

type ValintaperusteetLinkProps = {
  valintatapajonoOid: string;
  jononSijainti: JononSijainti;
  // Valitun järjestyskriteerin tulos hakemuksen valintalaskennan tuloksista
  tulos?: JarjestyskriteeriModel;
};

// Laskennan tuloksiin ei tallennu järjestyskriteerin OIDia, joten järjestyskriteeri etsitään
// valintatapajonon järjestyskriteereistä. Tulokseen tallentunut prioriteetti on järjestyskriteerin
// indeksi jonon kaikkien (myös ei-aktiivisten) järjestyskriteerien joukossa laskentahetkellä, ja
// nimeksi tallentuu järjestyskriteerin laskentakaavan nimi. Järjestyskriteerit ovat voineet muuttua
// laskennan jälkeen, joten järjestyskriteeriin linkitetään vain, jos se on aktiivinen ja sen
// laskentakaavan nimi vastaa tulosta. Muuten linkitetään valintatapajonoon, jonka
// järjestyskriteereistä oikean voi valita itse.
const useJarjestyskriteerinLinkki = ({
  valintatapajonoOid,
  jononSijainti,
  tulos,
}: ValintaperusteetLinkProps) => {
  const { data: jarjestyskriteerit } = useSuspenseQuery(
    queryOptionsGetValintatapajononJarjestyskriteerit(valintatapajonoOid),
  );
  const jarjestyskriteeri = tulos && jarjestyskriteerit[tulos.prioriteetti];
  const tarkistettava = jarjestyskriteeri?.aktiivinen
    ? jarjestyskriteeri
    : undefined;

  // Laskentakaava haetaan vain, jos järjestyskriteeri on tarkistettavissa
  const [laskentakaava] = useSuspenseQueries({
    queries: (tarkistettava ? [tarkistettava.laskentakaavaId] : []).map((id) =>
      queryOptionsGetLaskentakaava(id),
    ),
  }).map(({ data }) => data);

  const tunnistettu =
    tarkistettava != null && laskentakaava?.nimi === tulos?.nimi;

  return {
    tunnistettu,
    href: tunnistettu
      ? buildLinkToJarjestyskriteeri({
          ...jononSijainti,
          valintatapajonoOid,
          jarjestyskriteeriOid: tarkistettava.oid,
        })
      : buildLinkToValintatapajono({ ...jononSijainti, valintatapajonoOid }),
  };
};

const ValintaperusteetLinkContent = (props: ValintaperusteetLinkProps) => {
  const { t } = useTranslations();
  const { href } = useJarjestyskriteerinLinkki(props);
  return (
    <ExternalLink
      name={t('valintalaskentahistoria.valintaperusteen-mallinnus')}
      href={href}
    />
  );
};

const ValintaperusteetLinkInfoContent = (props: ValintaperusteetLinkProps) => {
  const { t } = useTranslations();
  const { tunnistettu } = useJarjestyskriteerinLinkki(props);
  return tunnistettu ? null : (
    <InfoTooltipButton
      title={t('valintalaskentahistoria.valintaperusteet-link-tooltip-title')}
      ariaLabel={t(
        'valintalaskentahistoria.valintaperusteet-link-tooltip-label',
      )}
      maxWidth={TOOLTIP_MAX_WIDTH}
    />
  );
};

// Linkki järjestyskriteerin (tai valintatapajonon) mallinnukseen valintaperusteissa
export const ValintaperusteetLink = (props: ValintaperusteetLinkProps) => {
  const { t } = useTranslations();
  return (
    <QuerySuspenseBoundary
      suspenseFallback={<ClientSpinner size={16} />}
      errorFallbackRender={() =>
        t('valintalaskentahistoria.linkin-muodostus-epaonnistui')
      }
    >
      <ValintaperusteetLinkContent {...props} />
    </QuerySuspenseBoundary>
  );
};

// Lisätietopainike, joka kertoo, miksi linkki vie valintatapajonoon eikä järjestyskriteeriin.
// Käyttää samoja kyselyitä kuin linkki, joten se näkyy samaan aikaan linkin kanssa.
export const ValintaperusteetLinkInfo = (props: ValintaperusteetLinkProps) => (
  <QuerySuspenseBoundary
    suspenseFallback={null}
    errorFallbackRender={() => null}
  >
    <ValintaperusteetLinkInfoContent {...props} />
  </QuerySuspenseBoundary>
);
