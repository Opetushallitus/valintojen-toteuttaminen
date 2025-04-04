import { ErrorWithIcon } from '@/components/error-with-icon';
import { SimpleAccordion } from '@/components/simple-accordion';
import { useTranslations } from '@/lib/localization/useTranslations';
import { isEmpty } from '@/lib/common';
import { NDASH } from '@/lib/constants';
import { LaskentaActorRef } from '@/lib/state/laskenta-state';
import { Hakukohde } from '@/lib/kouta/kouta-types';
import { Box, Stack, Typography } from '@mui/material';
import { useSelector } from '@xstate/react';

export const SuorittamattomatHakukohteet = ({
  actorRef,
  hakukohteet,
  onlyErrors = false,
}: {
  actorRef: LaskentaActorRef;
  hakukohteet: Array<Hakukohde>;
  onlyErrors?: boolean;
}) => {
  const { t, translateEntity } = useTranslations();

  const summaryIlmoitus = useSelector(
    actorRef,
    (s) => s.context.summary?.ilmoitus,
  );

  const summaryErrors = useSelector(actorRef, (s) =>
    s.context.summary?.hakukohteet.filter((hk) =>
      onlyErrors ? hk?.tila === 'VIRHE' : hk?.tila !== 'VALMIS',
    ),
  );

  return isEmpty(summaryErrors) ? null : (
    <SimpleAccordion
      titleOpen={t('valintalaskenta.piilota-suorittamattomat-hakukohteet')}
      titleClosed={t('valintalaskenta.nayta-suorittamattomat-hakukohteet')}
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
                    {t('valintalaskenta.syy')}:
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
  );
};
