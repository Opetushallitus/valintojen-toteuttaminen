'use client';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { getHakukohteetQueryOptions } from '@/lib/kouta/kouta-service';
import { Haku } from '@/lib/kouta/kouta-types';
import { useTranslations } from '@/lib/localization/useTranslations';
import { haunAsetuksetQueryOptions } from '@/lib/ohjausparametrit/useHaunAsetukset';
import { useLaskentaState } from '@/lib/state/laskenta-state';
import { Stack } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useSuspenseQueries } from '@tanstack/react-query';
import { ValintalaskentaResult } from '@/components/ValintalaskentaResult';

export const YhteisvalinnanValintalaskenta = ({ haku }: { haku: Haku }) => {
  const { t } = useTranslations();

  const { data: userPermissions } = useUserPermissions();

  const [{ data: haunAsetukset }, { data: hakukohteet }] = useSuspenseQueries({
    queries: [
      haunAsetuksetQueryOptions({ hakuOid: haku.oid }),
      getHakukohteetQueryOptions(haku.oid, userPermissions),
    ],
  });

  const { actorRef, state, startLaskentaWithParams } = useLaskentaState();

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Stack direction="row" spacing={3} sx={{ justifyContent: 'flex-start' }}>
        <OphButton
          disabled={state.hasTag('started')}
          variant="contained"
          onClick={() =>
            startLaskentaWithParams({
              haku,
              haunAsetukset,
              hakukohteet: null,
              valintakoelaskenta: true,
            })
          }
        >
          {t('yhteisvalinnan-hallinta.valintakoelaskenta-haulle')}
        </OphButton>
        <OphButton
          disabled={state.hasTag('started')}
          variant="contained"
          onClick={() =>
            startLaskentaWithParams({
              haku,
              haunAsetukset,
              hakukohteet: null,
              valinnanvaiheNumber: -1,
            })
          }
        >
          {t('yhteisvalinnan-hallinta.valintalaskenta-haulle')}
        </OphButton>
        <OphButton
          disabled={state.hasTag('started')}
          variant="contained"
          onClick={() =>
            startLaskentaWithParams({
              haku,
              haunAsetukset,
              hakukohteet: null,
            })
          }
        >
          {t('yhteisvalinnan-hallinta.kaikki-laskennat-haulle')}
        </OphButton>
      </Stack>
      <ValintalaskentaResult
        actorRef={actorRef}
        hakukohteet={hakukohteet}
        progressType="bar"
      />
    </Stack>
  );
};
