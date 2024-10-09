'use client';

import { QuerySuspenseBoundary } from '@/app/components/query-suspense-boundary';
import { TabContainer } from '../components/tab-container';
import { FullClientSpinner } from '@/app/components/client-spinner';
import { Box, InputAdornment, OutlinedInput } from '@mui/material';
import {
  HakemuksenHarkinnanvaraisuus,
  harkinnanvaraisetTilatOptions,
  useHarkinnanvaraisetHakemukset,
} from './hooks/useHakinnanvaraisetHakemukset';
import {
  HarkinnanvarainenTilaValue,
  HarkinnanvaraisetTable,
  HarkinnanvaraisetTilatByHakemusOids,
} from './components/harkinnanvaraiset-table';
import { FormBox } from '@/app/components/form-box';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/app/hooks/useTranslations';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { useHarkinnanvaraisetSearchParams } from './hooks/useHarkinnanvaraisetSearchParams';
import { SaveOutlined, Search } from '@mui/icons-material';
import { PageSizeSelector } from '@/app/components/table/page-size-selector';
import { useHarkinnanvaraisetPaginationQueryParams } from './hooks/useHarkinnanvaraisetPaginated';
import { HarkinnanvaraisetActionBar } from './components/harkinnanvaraiset-action-bar';
import { EMPTY_OBJECT, EMPTY_STRING_SET } from '@/app/lib/common';
import {
  HarkinnanvaraisestiHyvaksytty,
  setHarkinnanvaraisetTilat,
} from '@/app/lib/valintalaskenta-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useToaster from '@/app/hooks/useToaster';
import { SpinnerIcon } from '@/app/components/spinner-icon';
import { useHasChanged } from '@/app/hooks/useHasChanged';

export const HarkinnanvaraisetSearch = () => {
  const { searchPhrase, setSearchPhrase } = useHarkinnanvaraisetSearchParams();
  const { t } = useTranslations();
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchPhrase(e.target.value);
  };

  return (
    <OphFormControl
      label={t('harkinnanvaraiset.hae')}
      sx={{
        minWidth: '380px',
        textAlign: 'left',
      }}
      renderInput={({ labelId }) => (
        <OutlinedInput
          inputProps={{ 'aria-labelledby': labelId }}
          defaultValue={searchPhrase}
          onChange={handleSearchChange}
          endAdornment={
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          }
        />
      )}
    />
  );
};

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

const HarkinnanvaraisetForm = ({
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

const HarkinnanvaraisetContent = ({
  hakuOid,
  hakukohdeOid,
}: {
  hakuOid: string;
  hakukohdeOid: string;
}) => {
  const harkinnanvaraisetHakemukset = useHarkinnanvaraisetHakemukset({
    hakuOid,
    hakukohdeOid,
  });

  const { pageSize, setPageSize } = useHarkinnanvaraisetPaginationQueryParams();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <HarkinnanvaraisetSearch />
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </Box>
      <HarkinnanvaraisetForm
        hakuOid={hakuOid}
        hakukohdeOid={hakukohdeOid}
        harkinnanvaraisetHakemukset={harkinnanvaraisetHakemukset}
      />
    </Box>
  );
};

export default function HarkinnanvaraisetPage({
  params,
}: {
  params: { oid: string; hakukohde: string };
}) {
  return (
    <TabContainer>
      <QuerySuspenseBoundary suspenseFallback={<FullClientSpinner />}>
        <HarkinnanvaraisetContent
          hakuOid={params.oid}
          hakukohdeOid={params.hakukohde}
        />
      </QuerySuspenseBoundary>
    </TabContainer>
  );
}
