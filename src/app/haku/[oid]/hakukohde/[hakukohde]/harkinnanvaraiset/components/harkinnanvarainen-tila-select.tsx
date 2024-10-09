import { LocalizedSelect } from '@/app/components/localized-select';
import { useTranslations } from '@/app/hooks/useTranslations';
import { isDefined } from 'remeda';
import { HarkinnanvarainenTila } from '@/app/lib/valintalaskenta-service';
import { ophColors } from '@opetushallitus/oph-design-system';
import {
  HarkinnanvarainenTilaValue,
  HarkinnanvaraisetTilatByHakemusOids,
} from '@/app/lib/types/harkinnanvaraiset-types';

export const TRANSLATIONS_PREFIX = 'harkinnanvaraiset.taulukko';

export const TILA_LABEL_TRANSLATION_KEY = `${TRANSLATIONS_PREFIX}.harkinnanvarainen-tila`;

export const HarkinnanvarainenTilaSelect = ({
  harkinnanvarainenTila,
  hakemusOid,
  harkinnanvaraisetTilat,
  onHarkinnanvaraisetTilatChange,
}: {
  harkinnanvarainenTila: HarkinnanvarainenTila;
  hakemusOid: string;
  harkinnanvaraisetTilat: HarkinnanvaraisetTilatByHakemusOids;
  onHarkinnanvaraisetTilatChange?: (
    harkinnanvaraisetTilaChanges: HarkinnanvaraisetTilatByHakemusOids,
  ) => void;
}) => {
  const { t } = useTranslations();
  const isDirty = isDefined(harkinnanvaraisetTilat[hakemusOid]);
  return (
    <LocalizedSelect
      sx={{
        minWidth: '150px',
        '& .MuiOutlinedInput-notchedOutline': isDirty
          ? {
              borderColor: ophColors.yellow1,
              borderWidth: '2px',
            }
          : {},
      }}
      clearable={true}
      inputProps={{
        'aria-label': t(`${TRANSLATIONS_PREFIX}.harkinnanvarainen-tila`),
      }}
      placeholder={t('harkinnanvaraiset.tila-placeholder')}
      options={[
        {
          label: t('harkinnanvaraiset.hyvaksytty'),
          value: 'HYVAKSYTTY',
        },
        {
          label: t('harkinnanvaraiset.ei-hyvaksytty'),
          value: 'EI_HYVAKSYTTY',
        },
      ]}
      value={harkinnanvaraisetTilat[hakemusOid] ?? harkinnanvarainenTila ?? ''}
      onChange={(e) => {
        onHarkinnanvaraisetTilatChange?.({
          [hakemusOid]: e.target.value as HarkinnanvarainenTilaValue,
        });
      }}
    />
  );
};
