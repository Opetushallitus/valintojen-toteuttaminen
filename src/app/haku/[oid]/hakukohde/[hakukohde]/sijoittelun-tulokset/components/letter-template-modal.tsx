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
import {
  CalendarTodayOutlined,
  KeyboardArrowRight,
  KeyboardArrowLeft,
} from '@mui/icons-material';
import { capitalize } from 'remeda';

const CALENDAR_CLASSNAME = 'oph-calendar';

const CalendarStyles = styled(Box)(({ theme }) => ({
  '.oph-calendar': {
    '.react-datepicker': {
      '&__header': {
        backgroundColor: ophColors.white,
        borderBottom: 'none',
        paddingTop: '0.7rem',
        'h2.react-datepicker__current-month, .react-datepicker-time__header': {
          ...theme.typography.label,
        },
      },
      '&__day': {
        fontSize: 'inherit',
        width: '2rem',
        height: '2rem',
        lineHeight: '2rem',
        verticalAlign: 'bottom',
      },
      '&__day--selected, &__day--keyboard-selected, &__day:hover:not(&__day--disabled)':
        {
          backgroundColor: ophColors.blue2,
          borderRadius: 45,
          color: ophColors.white,
        },
      '&__day-name': {
        color: ophColors.grey400,
        width: '2rem',
        marginTop: '0.5rem',
      },
    },
    '.react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item':
      {
        height: 'unset',
        marginBottom: '0.2rem',
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
    '&__navigation': {
      marginTop: '0.25rem',
      marginLeft: '0.7rem',
      marginRight: '0.7rem',
      '&-icon': {
        border: '1px solid',
        borderColor: ophColors.grey300,
        borderRadius: 45,
        color: ophColors.grey300,
        '&:hover': {
          borderColor: ophColors.blue2,
          color: ophColors.blue2,
        },
      },
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
        placeholder={t('kalenteri.syote-vihje')}
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
            timeCaption={t('kalenteri.aika')}
            dateFormat="dd.MM.yyyy HH:mm"
            formatWeekDay={(wd) => capitalize(wd).substring(0, 2)}
            locale={language}
            placeholderText={t('kalenteri.syote-vihje')}
            popperContainer={({ children }: { children?: ReactNode }) => (
              <Box sx={{ position: 'fixed', zIndex: 9999, width: '100%' }}>
                {children}
              </Box>
            )}
            popperPlacement="bottom-start"
            renderCustomHeader={({
              monthDate,
              decreaseMonth,
              increaseMonth,
            }) => (
              <div>
                <button
                  aria-label="Previous Month"
                  className={
                    'react-datepicker__navigation react-datepicker__navigation--previous oph-calendar__navigation'
                  }
                  onClick={decreaseMonth}
                >
                  <KeyboardArrowLeft className="oph-calendar__navigation-icon" />
                </button>
                <span className="react-datepicker__current-month">
                  {capitalize(
                    monthDate.toLocaleString(language, {
                      month: 'long',
                      year: 'numeric',
                    }),
                  )}
                </span>
                <button
                  aria-label="Next Month"
                  className={
                    'react-datepicker__navigation react-datepicker__navigation--next oph-calendar__navigation'
                  }
                  onClick={increaseMonth}
                >
                  <KeyboardArrowRight className="oph-calendar__navigation-icon" />
                </button>
              </div>
            )}
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
