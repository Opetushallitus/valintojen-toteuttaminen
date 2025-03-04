import { useTranslations } from '@/lib/localization/useTranslations';
import { Edit } from '@mui/icons-material';
import { OphButton } from '@opetushallitus/oph-design-system';

export const EditButton = ({
  onClick,
  label,
}: {
  label?: string;
  onClick: () => void;
}) => {
  const { t } = useTranslations();
  return (
    <OphButton
      sx={{ paddingX: 0 }}
      variant="text"
      startIcon={<Edit />}
      onClick={onClick}
    >
      {label ?? t('yleinen.muokkaa')}
    </OphButton>
  );
};
