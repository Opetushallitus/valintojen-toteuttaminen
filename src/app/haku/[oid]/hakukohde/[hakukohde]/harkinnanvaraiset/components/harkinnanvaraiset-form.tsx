import { FormBox } from '@/app/components/form-box';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import useToaster from '@/app/hooks/useToaster';
import { useTranslations } from '@/app/hooks/useTranslations';
import { EMPTY_OBJECT, EMPTY_STRING_SET } from '@/app/lib/common';
import {
  HakemuksenHarkinnanvaraisuus,
  HarkinnanvarainenTilaValue,
  HarkinnanvaraisestiHyvaksytty,
  HarkinnanvaraisetTilatByHakemusOids,
} from '@/app/lib/types/harkinnanvaraiset-types';
import { setHarkinnanvaraisetTilat } from '@/app/lib/valintalaskenta/valintalaskenta-service';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { isEmpty } from 'remeda';
import { harkinnanvaraisetTilatOptions } from '../hooks/useHarkinnanvaraisetHakemukset';
import { HarkinnanvaraisetActionBar } from './harkinnanvaraiset-action-bar';
import { HarkinnanvaraisetTable } from './harkinnanvaraiset-table';
import { useConfirmChangesBeforeNavigation } from '@/app/hooks/useConfirmChangesBeforeNavigation';

const useTallennaMutation = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const { addToast } = useToaster();

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      harkinnanvaraisetTilat: Record<string, HarkinnanvarainenTilaValue>,
    ) => {
      const harkinnanvaraisetValues = Object.entries(
        harkinnanvaraisetTilat,
      ).map(([hakemusOid, tila]) => ({
        hakuOid,
        hakukohdeOid,
        hakemusOid,
        harkinnanvaraisuusTila: tila === '' ? undefined : tila,
      }));
      await setHarkinnanvaraisetTilat(harkinnanvaraisetValues);
      queryClient.setQueryData(
        harkinnanvaraisetTilatOptions({ hakuOid, hakukohdeOid }).queryKey,
        (oldData) => {
          const unchangedOldValues = (oldData ?? []).filter(
            (old) =>
              harkinnanvaraisetTilat[old.hakemusOid] ===
              (old.harkinnanvaraisuusTila ?? ''),
          );

          const changedValues = harkinnanvaraisetValues.filter((value) => {
            return value.harkinnanvaraisuusTila != null;
          }) as Array<HarkinnanvaraisestiHyvaksytty>;

          return unchangedOldValues.concat(changedValues);
        },
      );
    },
    onError: (e) => {
      addToast({
        key: 'set-harkinnanvaraiset-tilat-error',
        message: 'harkinnanvaraiset.virhe-tallenna',
        type: 'error',
      });
      console.error(e);
    },
    onSuccess: () => {
      addToast({
        key: 'set-harkinnanvaraiset-tilat-success',
        message: 'harkinnanvaraiset.tallennettu',
        type: 'success',
      });
    },
  });
};

export const HarkinnanvaraisetForm = ({
  hakuOid,
  hakukohdeOid,
  harkinnanvaraisetHakemukset,
}: {
  hakuOid: string;
  hakukohdeOid: string;
  harkinnanvaraisetHakemukset: Array<HakemuksenHarkinnanvaraisuus>;
}) => {
  const { t } = useTranslations();

  const [selection, setSelection] = useState<Set<string>>(
    () => EMPTY_STRING_SET,
  );

  const [harkinnanvaraisetTilat, setHarkinnanvaraisetTilat] =
    useState<HarkinnanvaraisetTilatByHakemusOids>(() => EMPTY_OBJECT);

  const isDirty = !isEmpty(harkinnanvaraisetTilat);

  useConfirmChangesBeforeNavigation(isDirty);

  const { mutate, isPending } = useTallennaMutation({ hakuOid, hakukohdeOid });

  const handleHarkinnanvaraisetTilatChange = useCallback(
    (harkinnanvaraisetTilaChanges: HarkinnanvaraisetTilatByHakemusOids) => {
      const newTilat = {
        ...harkinnanvaraisetTilat,
        ...harkinnanvaraisetTilaChanges,
      };
      harkinnanvaraisetHakemukset.forEach((hakemus) => {
        if (
          newTilat[hakemus.hakemusOid] === (hakemus.harkinnanvarainenTila ?? '')
        ) {
          delete newTilat[hakemus.hakemusOid];
        }
      });
      setHarkinnanvaraisetTilat(newTilat);
    },
    [
      setHarkinnanvaraisetTilat,
      harkinnanvaraisetTilat,
      harkinnanvaraisetHakemukset,
    ],
  );

  const harkinnanvaraisetHakemuksetChanged = useHasChanged(
    harkinnanvaraisetHakemukset,
  );

  useEffect(() => {
    if (harkinnanvaraisetHakemuksetChanged) {
      handleHarkinnanvaraisetTilatChange({});
    }
  }, [harkinnanvaraisetHakemuksetChanged, handleHarkinnanvaraisetTilatChange]);

  return (
    <FormBox
      onSubmit={(event) => {
        event.preventDefault();
        mutate(harkinnanvaraisetTilat);
      }}
      autoComplete="off"
      sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}
    >
      <OphButton
        variant="contained"
        type="submit"
        sx={{ alignSelf: 'flex-start' }}
        loading={isPending}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      <HarkinnanvaraisetActionBar
        selection={selection}
        onHarkinnanvaraisetTilatChange={handleHarkinnanvaraisetTilatChange}
        resetSelection={() => setSelection(EMPTY_STRING_SET)}
      />
      <HarkinnanvaraisetTable
        data={harkinnanvaraisetHakemukset}
        selection={selection}
        setSelection={setSelection}
        onHarkinnanvaraisetTilatChange={handleHarkinnanvaraisetTilatChange}
        harkinnanvaraisetTilat={harkinnanvaraisetTilat}
      />
    </FormBox>
  );
};
