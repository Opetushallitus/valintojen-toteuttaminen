'use client';

import { ListTable } from '@/app/components/table/list-table';
import {
  makeExternalLinkColumn,
} from '@/app/components/table/table-columns';

export type HakukohdeWithLink = {
  oid: string;
  name: string;
  link: string;
}

type ValintaryhmaHakukohdeTableProps = {
  hakukohteet: HakukohdeWithLink[];
}

export const ValintaryhmaHakukohdeTable = ({hakukohteet}: ValintaryhmaHakukohdeTableProps) => {

  const nameColumn = makeExternalLinkColumn<HakukohdeWithLink>({
    title: 'valintaryhmittain.hakukohteet',
    key: 'oid',
    linkProp: 'link',
    nameProp: 'name',
    linkBuilder: (row) => row,
  });

  const columns = [
    nameColumn,
  ];

  return (
    <ListTable
      rowKeyProp="oid"
      columns={columns}
      rows={hakukohteet}
    />
  );
};
