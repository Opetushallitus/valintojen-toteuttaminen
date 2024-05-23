'use client';
import Header from '@/app/components/header';
import { useTranslations } from '@/app/hooks/useTranslations';
import { getHaku } from '@/app/lib/kouta';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function HeaderPage({ params }: { params: { oid: string } }) {
  const { data: hakuNimi } = useSuspenseQuery({
    queryKey: ['getHaku', params.oid],
    queryFn: () => getHaku(params.oid),
  });

  const { translateEntity } = useTranslations();

  return <Header title={translateEntity(hakuNimi)} />;
}
