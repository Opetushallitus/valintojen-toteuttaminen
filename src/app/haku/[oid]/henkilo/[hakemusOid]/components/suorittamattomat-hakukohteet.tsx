import { ErrorWithIcon } from '@/app/components/error-with-icon';
import { SimpleAccordion } from '@/app/components/simple-accordion';
import { useTranslations } from '@/app/hooks/useTranslations';
import { NDASH } from '@/app/lib/constants';
import { LaskentaActorRef } from '@/app/lib/state/laskenta-state';
import { Hakukohde } from '@/app/lib/types/kouta-types';
import { Box, Stack, Typography } from '@mui/material';
import { useSelector } from '@xstate/react';

export const SuorittamattomatHakukohteet = ({
  actorRef,
  hakukohteet,
}: {
  actorRef: LaskentaActorRef;
  hakukohteet: Array<Hakukohde>;
}) => {
  const { t, translateEntity } = useTranslations();

  const summaryIlmoitus = useSelector(
    actorRef,
    (s) => s.context.summary?.ilmoitus,
  );

  const summaryErrors = useSelector(actorRef, (s) =>
    s.context.summary?.hakukohteet.filter((hk) => hk?.tila !== 'VALMIS'),
  );

  return summaryErrors ? (
    <SimpleAccordion
      titleOpen={t('henkilo.piilota-suorittamattomat-hakukohteet')}
      titleClosed={t('henkilo.nayta-suorittamattomat-hakukohteet')}
    >
      <Stack spacing={1} sx={{ paddingLeft: 3 }}>
        {summaryErrors?.map((error) => {
          const hakukohde = hakukohteet.find(
            (hk) => hk.oid === error.hakukohdeOid,
          );
          const ilmoitukset = error.ilmoitukset;
          return (
            <ErrorWithIcon key={error.hakukohdeOid}>
              <>
                <Typography>
                  {translateEntity(hakukohde?.jarjestyspaikkaHierarkiaNimi)}
                  {` ${NDASH} `}
                  {translateEntity(hakukohde?.nimi)} ({error.hakukohdeOid})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography component="span" variant="label">
                    {t('henkilo.syy')}:
                  </Typography>
                  <Box>
                    {(error.ilmoitukset?.length ?? 0) > 0 ? (
                      ilmoitukset?.map((ilmoitus) => (
                        <Typography
                          key={`${error.hakukohdeOid}_${ilmoitus.otsikko}`}
                        >
                          {ilmoitus?.otsikko}
                        </Typography>
                      ))
                    ) : (
                      <Typography>
                        {error.tila === 'TEKEMATTA' && summaryIlmoitus
                          ? summaryIlmoitus?.otsikko
                          : error.tila}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </>
            </ErrorWithIcon>
          );
        })}
      </Stack>
    </SimpleAccordion>
  ) : null;
};
