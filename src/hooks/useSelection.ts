import { useCallback, useState } from 'react';
import { EMPTY_STRING_SET } from '@/lib/common';

export function useSelection(data: Array<unknown>) {
  const [selection, setSelection] = useState(() => EMPTY_STRING_SET);

  // Nollataan valinta kun data on ladattu uudestaan
  const [prevData, setPrevData] = useState(data);
  if (data !== prevData) {
    setPrevData(data);
    setSelection(EMPTY_STRING_SET);
  }
  return {
    selection,
    setSelection,
    resetSelection: useCallback(() => setSelection(new Set()), [setSelection]),
  };
}
