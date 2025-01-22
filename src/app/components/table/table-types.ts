export type KeysMatching<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O & string];

export type ListTableColumn<P> = {
  title?: string;
  // TODO: Key ja sortable pois. Tilalle sortBy-funktio.
  key: string;
  render: (props: P) => React.ReactNode;
  style?: React.CSSProperties;
  sortable?: boolean;
};

export type Row<K extends string = string> = Record<K, unknown>;
