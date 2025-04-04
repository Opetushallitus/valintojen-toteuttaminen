import { useCallback, useEffect, useState } from 'react';
import { useHasChanged } from './useHasChanged';
import { EMPTY_STRING_SET } from '@/lib/common';

export function useSelection(data: Array<unknown>) {
  const [selection, setSelection] = useState(() => EMPTY_STRING_SET);

  // Nollataan valinta kun data on ladattu uudestaan
  const hasHakemuksetChanged = useHasChanged(data);
  useEffect(() => {
    if (hasHakemuksetChanged) {
      setSelection(EMPTY_STRING_SET);
    }
  }, [hasHakemuksetChanged]);
  return {
    selection,
    setSelection,
    resetSelection: useCallback(() => setSelection(new Set()), [setSelection]),
  };
}
