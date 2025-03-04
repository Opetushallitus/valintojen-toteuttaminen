import { useTranslations } from '@/app/lib/localization/useTranslations';
import { OphFormFieldWrapper } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { EditorComponent } from '@/app/components/editor-component';
import { Kirjepohja } from '@/app/lib/valintalaskentakoostepalvelu/valintalaskentakoostepalvelu-types';
import { LocalizedSelect } from '@/app/components/localized-select';
import { SelectChangeEvent } from '@mui/material/Select';

export const TemplateSection = ({
  pohjat,
  templateBody,
  setTemplateBody,
  setLetterBody,
}: {
  pohjat: Kirjepohja[];
  templateBody: string;
  setTemplateBody: (val: string) => void;
  setLetterBody: (val: string) => void;
}) => {
  const { t } = useTranslations();
  const [usedPohja, setUsedPohja] = useState<Kirjepohja>(pohjat[0]);

  const changeUsedPohja = (event: SelectChangeEvent<string>) => {
    const pohja = pohjat.find((p) => p.nimi === event.target.value)!;
    setUsedPohja(pohja);
    setTemplateBody(pohja?.sisalto || '');
  };

  return (
    <>
      <OphFormFieldWrapper
        sx={{
          width: 'auto',
          minWidth: '140px',
          textAlign: 'left',
        }}
        label={t('kirje-modaali.valmispohja')}
        renderInput={({ labelId }) => (
          <LocalizedSelect
            id="kirjepohja-select"
            labelId={labelId}
            value={usedPohja?.nimi || ''}
            onChange={changeUsedPohja}
            options={pohjat.map((p) => ({
              value: p.nimi,
              label: t(`kirjepohja.${p.nimi}`, p.nimi),
            }))}
            clearable
          />
        )}
      />
      <EditorComponent
        editorContent={templateBody}
        onContentChanged={setLetterBody}
      />
    </>
  );
};
