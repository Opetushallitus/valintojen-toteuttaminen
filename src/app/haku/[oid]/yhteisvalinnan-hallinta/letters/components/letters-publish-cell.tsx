import { useTranslations } from '@/lib/localization/useTranslations';
import { Haku } from '@/lib/kouta/kouta-types';
import { LetterStats, translateLetter } from '../lib/letter-options';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { ConfirmationModal } from '@/components/modals/confirmation-modal';
import { publishLetters } from '@/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-service';
import useToaster from '@/hooks/useToaster';
import { styled } from '@/lib/theme';

const StyledCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: theme.spacing(2),
  flexWrap: 'wrap',
  rowGap: theme.spacing(1),
  alignItems: 'center',
}));

export const LettersPublishCell = ({
  haku,
  letterStats,
  refetchLetterCounts,
}: {
  haku: Haku;
  letterStats: LetterStats;
  refetchLetterCounts: () => void;
}) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const [askingConfirmation, setAskingConfirmation] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const publish = async () => {
    setAskingConfirmation(false);
    setPublishing(true);
    try {
      await publishLetters(
        haku.oid,
        letterStats.letter.letterType,
        letterStats.letter.lang,
      );
      addToast({
        key: `julkaistu-kirjeet-${haku.oid}-${letterStats.letter.id}`,
        message: `${translateLetter(letterStats.letter, t, true)} ${t('yhteisvalinnan-hallinta.kirjeet.julkaistu')}`,
        type: 'success',
      });
      refetchLetterCounts();
    } catch (error) {
      console.error(error);
      addToast({
        key: `julkaistu-kirjeet-${haku.oid}-${letterStats.letter.id}-virhe`,
        message: `${translateLetter(letterStats.letter, t, true)} ${t('yhteisvalinnan-hallinta.kirjeet.julkaisussa-virhe')}`,
        type: 'error',
      });
    }
    setPublishing(false);
  };

  return (
    <>
      <ConfirmationModal
        title={t('yhteisvalinnan-hallinta.kirjeet.vahvista-julkaisu')}
        open={askingConfirmation}
        onConfirm={publish}
        onCancel={() => setAskingConfirmation(false)}
      >
        <Typography>
          {`${t('yhteisvalinnan-hallinta.kirjeet.julkaisemassa')} ${translateLetter(letterStats.letter, t, true).toLowerCase()}.`}
        </Typography>
      </ConfirmationModal>
      <StyledCell>
        <Typography>{letterStats.letterPublishedCount}</Typography>
        <OphButton
          onClick={() => setAskingConfirmation(true)}
          variant="contained"
          loading={publishing}
          disabled={!letterStats.readyForPublish}
        >
          {t('yhteisvalinnan-hallinta.kirjeet.julkaise')}
        </OphButton>
      </StyledCell>
    </>
  );
};
