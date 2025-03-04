import { LocalizedSelect } from '@/components/localized-select';
import { useTranslations } from '@/lib/localization/useTranslations';
import { isDefined } from 'remeda';
import { ophColors } from '@opetushallitus/oph-design-system';
import {
  HarkinnanvarainenTila,
  HarkinnanvarainenTilaValue,
  HarkinnanvaraisetTilatByHakemusOids,
} from '@/lib/types/harkinnanvaraiset-types';

export const TRANSLATIONS_PREFIX = 'harkinnanvaraiset.taulukko';

export const TILA_LABEL_TRANSLATION_KEY = `${TRANSLATIONS_PREFIX}.harkinnanvarainen-tila`;

export const HarkinnanvarainenTilaSelect = ({
  hakemusOid,
  hakijanNimi,
  harkinnanvarainenTila,
  harkinnanvaraisetTilat,
  onHarkinnanvaraisetTilatChange,
}: {
  hakemusOid: string;
  hakijanNimi: string;
  harkinnanvarainenTila: HarkinnanvarainenTila;
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
        'aria-label': t(
          `${TRANSLATIONS_PREFIX}.harkinnanvarainen-tila-hakijalle`,
          { hakijanNimi },
        ),
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
