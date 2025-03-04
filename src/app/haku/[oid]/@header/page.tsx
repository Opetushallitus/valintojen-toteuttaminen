'use client';
import { use } from 'react';
import { Header } from '@/components/header';
import { useHaku } from '@/lib/kouta/useHaku';
import { useTranslations } from '@/lib/localization/useTranslations';

export default function HeaderPage(props: {
  params: Promise<{ oid: string }>;
}) {
  const params = use(props.params);
  const { data: haku } = useHaku({ hakuOid: params.oid });

  const { translateEntity } = useTranslations();

  return <Header title={translateEntity(haku.nimi)} />;
}
