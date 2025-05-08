import { useTranslations } from '@/lib/localization/useTranslations';
import { EMPTY_STRING_SET } from '@/lib/common';
import { styled } from '@/lib/theme';
import { Checkbox } from '@mui/material';
import { map, pipe } from 'remeda';
import { memo } from 'react';

const ListCheckbox = styled(Checkbox)({
  padding: 0,
});

export type SelectionProps = {
  selection: Set<string>;
  setSelection?: (
    newSelection: Set<string> | ((oldSelection: Set<string>) => Set<string>),
  ) => void;
};

export const TableHeaderCheckbox = function <R>({
  selection = EMPTY_STRING_SET,
  setSelection,
  rows,
  rowKeyProp,
}: SelectionProps & {
  rows: Array<R>;
  rowKeyProp: keyof R;
}) {
  const { t } = useTranslations();

  return (
    <ListCheckbox
      checked={selection.size === rows.length}
      indeterminate={
        selection.size > 0 &&
        selection.size !== rows.length &&
        selection.size !== 0
      }
      slotProps={{
        input: {
          'aria-label': t('yleinen.valitse-kaikki'),
        },
      }}
      onChange={(
        _event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean,
      ) => {
        if (checked) {
          setSelection?.(
            pipe(
              rows,
              map((item) => item[rowKeyProp] as string),
              (array) => new Set(array),
            ),
          );
        } else {
          setSelection?.(EMPTY_STRING_SET);
        }
      }}
    />
  );
};

export const TableRowCheckbox = memo(function TableRowCheckbox({
  checked,
  setSelection,
  rowId,
  label,
}: {
  rowId: string;
  checked: boolean;
  setSelection?: SelectionProps['setSelection'];
  label?: string;
}) {
  return (
    <ListCheckbox
      checked={checked}
      slotProps={{
        input: {
          'aria-label': label,
        },
      }}
      value={rowId}
      onChange={(
        _event: React.ChangeEvent<HTMLInputElement>,
        newChecked: boolean,
      ) => {
        setSelection?.((oldSelection) => {
          const newSelection = new Set(oldSelection);
          if (newChecked) {
            newSelection.add(rowId);
          } else {
            newSelection.delete(rowId);
          }
          return newSelection;
        });
      }}
    />
  );
});
