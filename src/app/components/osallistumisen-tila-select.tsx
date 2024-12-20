import { useTranslations } from '@/app/hooks/useTranslations';
import { LocalizedSelect } from './localized-select';

export const OsallistumisenTilaSelect = (
  props: Omit<React.ComponentProps<typeof LocalizedSelect>, 'options'>,
) => {
  const { t } = useTranslations();
  return (
    <LocalizedSelect
      {...props}
      options={[
        {
          value: 'OSALLISTUI',
          label: t('valintakoe.osallistumisenTila.OSALLISTUI'),
        },
        {
          value: 'EI_OSALLISTUNUT',
          label: t('valintakoe.osallistumisenTila.EI_OSALLISTUNUT'),
        },
        {
          value: 'MERKITSEMATTA',
          label: t('valintakoe.osallistumisenTila.MERKITSEMATTA'),
        },
        {
          value: 'EI_VAADITA',
          label: t('valintakoe.osallistumisenTila.EI_VAADITA'),
        },
      ]}
    />
  );
};
