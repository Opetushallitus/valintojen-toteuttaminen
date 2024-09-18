import { useTranslations } from '@/app/hooks/useTranslations';
import { EMPTY_STRING_SET } from '@/app/lib/common';
import { styled } from '@/app/theme';
import { Checkbox } from '@mui/material';
import { map, pipe } from 'remeda';

const ListCheckbox = styled(Checkbox)({
  padding: 0,
});

type SelectionProps = {
  selection: Set<string>;
  onSelectionChange?: (selection: Set<string>) => void;
};

export const TableHeaderCheckbox = function <R>({
  selection = EMPTY_STRING_SET,
  onSelectionChange,
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
      inputProps={{ 'aria-label': t('yleinen.valitse-kaikki') }}
      onChange={(
        event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean,
      ) => {
        if (checked) {
          onSelectionChange?.(
            pipe(
              rows,
              map((item) => item[rowKeyProp] as string),
              (array) => new Set(array),
            ),
          );
        } else {
          onSelectionChange?.(EMPTY_STRING_SET);
        }
      }}
    />
  );
};

export const TableRowCheckbox = function <R>({
  selection,
  onSelectionChange,
  rowId,
  rowProps,
  getRowCheckboxLabel,
}: SelectionProps & {
  rowId: string;
  rowProps: R;
  getRowCheckboxLabel?: (row: R) => string;
}) {
  return (
    <ListCheckbox
      checked={selection.has(rowId)}
      inputProps={{
        'aria-label': getRowCheckboxLabel?.(rowProps),
      }}
      value={rowId}
      onChange={(
        event: React.ChangeEvent<HTMLInputElement>,
        checked: boolean,
      ) => {
        const newSelection = new Set(selection);
        if (checked) {
          newSelection.add(rowId);
          onSelectionChange?.(newSelection);
        } else {
          newSelection.delete(rowId);
          onSelectionChange?.(newSelection);
        }
      }}
    />
  );
};
