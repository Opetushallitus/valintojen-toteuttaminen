import { FormBox } from '@/components/form-box';
import { useHasChanged } from '@/hooks/useHasChanged';
import useToaster from '@/hooks/useToaster';
import { useTranslations } from '@/lib/localization/useTranslations';
import { EMPTY_OBJECT } from '@/lib/common';
import {
  HakemuksenHarkinnanvaraisuus,
  HarkinnanvarainenTilaValue,
  HarkinnanvaraisetTilatByHakemusOids,
} from '@/lib/types/harkinnanvaraiset-types';
import { saveHarkinnanvaraisetTilat } from '@/lib/valintalaskenta/valintalaskenta-service';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { isEmpty } from 'remeda';
import { harkinnanvaraisetTilatOptions } from '../hooks/useHarkinnanvaraisetHakemukset';
import { HarkinnanvaraisetActionBar } from './harkinnanvaraiset-action-bar';
import { HarkinnanvaraisetTable } from './harkinnanvaraiset-table';
import { useConfirmChangesBeforeNavigation } from '@/hooks/useConfirmChangesBeforeNavigation';
import { useSelection } from '@/hooks/useSelection';
import { KoutaOidParams } from '@/lib/kouta/kouta-types';

const useTallennaMutation = ({ hakuOid, hakukohdeOid }: KoutaOidParams) => {
  const { addToast } = useToaster();

  const queryClient = useQueryClient();

  const harkinnanvaraisetOptions = harkinnanvaraisetTilatOptions({
    hakuOid,
    hakukohdeOid,
  });

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
      await saveHarkinnanvaraisetTilat(harkinnanvaraisetValues);
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
      queryClient.resetQueries(harkinnanvaraisetOptions);
      queryClient.invalidateQueries(harkinnanvaraisetOptions);
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
}: KoutaOidParams & {
  harkinnanvaraisetHakemukset: Array<HakemuksenHarkinnanvaraisuus>;
}) => {
  const { t } = useTranslations();

  const { selection, setSelection, resetSelection } = useSelection(
    harkinnanvaraisetHakemukset,
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
        resetSelection={resetSelection}
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
