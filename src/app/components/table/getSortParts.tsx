export const getSortParts = (sortStr: string, colId?: string) => {
  const [orderBy, direction] = sortStr?.split(':') ?? '';

  if (
    (colId === undefined || colId === orderBy) &&
    (direction === 'asc' || direction === 'desc')
  ) {
    return { orderBy, direction } as {
      orderBy: string;
      direction: 'asc' | 'desc';
    };
  }
  return {
    orderBy: undefined,
    direction: undefined,
  };
};
