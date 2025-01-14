import { useTranslations } from '@/app/hooks/useTranslations';
import { Box, InputAdornment, styled } from '@mui/material';
import {
  OphButton,
  ophColors,
  OphInput,
} from '@opetushallitus/oph-design-system';
import { createModal, useOphModalProps } from '@/app/components/global-modal';
import { OphModalDialog } from '@/app/components/oph-modal-dialog';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { forwardRef, ReactNode, Ref, useState } from 'react';
import { OphFormControl } from '@/app/components/form/oph-form-control';
import { CalendarTodayOutlined } from '@mui/icons-material';
import { capitalize } from 'remeda';

const CALENDAR_CLASSNAME = 'oph-calendar';

const CalendarStyles = styled(Box)(({ theme }) => ({
  '.oph-calendar': {
    '.react-datepicker': {
      '&__header': {
        backgroundColor: ophColors.white,
        borderBottom: 'none',
        'h2.react-datepicker__current-month, .react-datepicker-time__header': {
          ...theme.typography.label,
        },
      },
      '&__day--selected, &__day--keyboard-selected, &__day:hover': {
        backgroundColor: ophColors.blue2,
        borderRadius: 45,
        color: ophColors.white,
      },
    },
    '.react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected':
      {
        backgroundColor: ophColors.blue2,
        '&:hover': {
          backgroundColor: ophColors.blue2,
        },
      },
    '.react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover':
      {
        backgroundColor: ophColors.blue2,
        color: ophColors.white,
      },
  },
  '.react-datepicker__triangle': {
    display: 'none',
  },
}));

const StyledOphInput = styled(OphInput)(() => ({
  marginTop: 2,
}));

interface CalendarInputProps {
  value?: string | Date;
  onClick?: () => void;
}

const TemplateModalContent = () => {
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const { t, language } = useTranslations();
  const CustomInput = forwardRef<Ref<HTMLInputElement>, CalendarInputProps>(
    (props, ref) => (
      <StyledOphInput
        value={props.value}
        onClick={props.onClick}
        ref={ref as Ref<HTMLInputElement>}
        endAdornment={
          <InputAdornment position="end">
            <CalendarTodayOutlined style={{ color: ophColors.blue2 }} />
          </InputAdornment>
        }
      />
    ),
  );
  CustomInput.displayName = 'calendar-time-input';

  return (
    <CalendarStyles>
      <OphFormControl
        label={t('sijoittelun-tulokset.toiminnot.palautuksen-erapaiva')}
        renderInput={({ labelId }) => (
          <DatePicker
            ariaLabelledBy={labelId}
            selected={deadlineDate}
            onChange={(date) => setDeadlineDate(date)}
            minDate={new Date()}
            customInput={<CustomInput />}
            calendarClassName={CALENDAR_CLASSNAME}
            showTimeSelect
            timeCaption={t('yleinen.aika')}
            dateFormat="dd.MM.yyyy hh:mm"
            formatWeekDay={(wd) => capitalize(wd).substring(0, 2)}
            locale={language}
            placeholderText="pp.kk.vvvv hh:mm"
            popperContainer={({ children }: { children?: ReactNode }) => (
              <Box sx={{ position: 'fixed', zIndex: 9999, width: '100%' }}>
                {children}
              </Box>
            )}
            popperPlacement="bottom-start"
          />
        )}
      />
    </CalendarStyles>
  );
};

export const LetterTemplateModal = createModal(
  ({ title }: { title: string }) => {
    const modalProps = useOphModalProps();

    const { t } = useTranslations();

    return (
      <OphModalDialog
        {...modalProps}
        title={t(title)}
        maxWidth="md"
        actions={
          <OphButton variant="outlined" onClick={modalProps.onClose}>
            {t('yleinen.sulje')}
          </OphButton>
        }
      >
        <TemplateModalContent />
      </OphModalDialog>
    );
  },
);
