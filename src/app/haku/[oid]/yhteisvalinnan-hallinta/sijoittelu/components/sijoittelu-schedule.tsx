import { CalendarComponent } from '@/components/calendar-component';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';

export const SijoitteluSchedule = () => {
  const { t } = useTranslations();
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

  return (
    <Box>
      <Typography variant="h2">
        {t('yhteisvalinnan-hallinta.sijoittelu.ajastettu-otsikko')}
      </Typography>
      <CalendarComponent
        setDate={setScheduledDate}
        selectedValue={scheduledDate}
      />
    </Box>
  );
};
