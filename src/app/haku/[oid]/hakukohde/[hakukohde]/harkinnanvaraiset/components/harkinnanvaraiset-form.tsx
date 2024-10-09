import { FormBox } from '@/app/components/form-box';
import { useHasChanged } from '@/app/hooks/useHasChanged';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useCallback, useEffect, useState } from 'react';
import { HarkinnanvaraisetActionBar } from './harkinnanvaraiset-action-bar';
import { SpinnerIcon } from '@/app/components/spinner-icon';
import { SaveOutlined } from '@mui/icons-material';
import {
  HarkinnanvarainenTilaValue,
  HarkinnanvaraisetTable,
  HarkinnanvaraisetTilatByHakemusOids,
} from './harkinnanvaraiset-table';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  HakemuksenHarkinnanvaraisuus,
  harkinnanvaraisetTilatOptions,
} from '../hooks/useHakinnanvaraisetHakemukset';
import { EMPTY_OBJECT, EMPTY_STRING_SET } from '@/app/lib/common';
import {
  HarkinnanvaraisestiHyvaksytty,
  setHarkinnanvaraisetTilat,
} from '@/app/lib/valintalaskenta-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useToaster from '@/app/hooks/useToaster';
import useConfirmChangesBeforeNavigation from '@/app/hooks/useConfirmChangesBeforeNavigation';
import { isEmpty } from 'remeda';

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

          const newValues = unchangedOldValues.concat(changedValues);
          return newValues;
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

  const onHarkinnanvaraisetTilatChange = useCallback(
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
      onHarkinnanvaraisetTilatChange({});
    }
  }, [harkinnanvaraisetHakemuksetChanged, onHarkinnanvaraisetTilatChange]);

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
        disabled={isPending}
        startIcon={isPending ? <SpinnerIcon /> : <SaveOutlined />}
      >
        {t('yleinen.tallenna')}
      </OphButton>
      <HarkinnanvaraisetActionBar
        selection={selection}
        onHarkinnanvaraisetTilatChange={onHarkinnanvaraisetTilatChange}
        resetSelection={() => setSelection(EMPTY_STRING_SET)}
      />
      <HarkinnanvaraisetTable
        data={harkinnanvaraisetHakemukset}
        selection={selection}
        setSelection={setSelection}
        onHarkinnanvaraisetTilatChange={onHarkinnanvaraisetTilatChange}
        harkinnanvaraisetTilat={harkinnanvaraisetTilat}
      />
    </FormBox>
  );
};
