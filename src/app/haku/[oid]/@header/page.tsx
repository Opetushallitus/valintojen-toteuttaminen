'use client';
import Header from '@/app/components/header';
import { useUserLanguage } from '@/app/hooks/useAsiointiKieli';
import { getHaku } from '@/app/lib/kouta';
import { translateName } from '@/app/lib/localization/translation-utils';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function HeaderPage({ params }: { params: { oid: string } }) {
  const { data: hakuNimi } = useSuspenseQuery({
    queryKey: ['getHaku', params.oid],
    queryFn: () => getHaku(params.oid),
  });

  const userLanguage = useUserLanguage();

  return <Header title={translateName(hakuNimi, userLanguage)} />;
}
