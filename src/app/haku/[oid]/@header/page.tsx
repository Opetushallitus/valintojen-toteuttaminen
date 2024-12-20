'use client';
import { use } from 'react';
import { Header } from '@/app/components/header';
import { useHaku } from '@/app/hooks/useHaku';
import { useTranslations } from '@/app/hooks/useTranslations';

export default function HeaderPage(props: {
  params: Promise<{ oid: string }>;
}) {
  const params = use(props.params);
  const { data: haku } = useHaku({ hakuOid: params.oid });

  const { translateEntity } = useTranslations();

  return <Header title={translateEntity(haku.nimi)} />;
}
