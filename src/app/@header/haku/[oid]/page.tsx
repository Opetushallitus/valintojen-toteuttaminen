'use client';
import Header from '@/app/components/header';
import { getTranslation } from '@/app/lib/common';
import { getHaku } from '@/app/lib/kouta';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function HeaderPage({ params }: { params: { oid: string } }) {
  const { data: hakuNimi } = useSuspenseQuery({
    queryKey: ['getHaku', params.oid],
    queryFn: () => getHaku(params.oid),
  });

  return <Header title={getTranslation(hakuNimi)} />;
}
