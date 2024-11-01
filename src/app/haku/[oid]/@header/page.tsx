'use client';
import { Header } from '@/app/components/header';
import { useHaku } from '@/app/hooks/useHaku';
import { useTranslations } from '@/app/hooks/useTranslations';

export default function HeaderPage({ params }: { params: { oid: string } }) {
  const { data: haku } = useHaku({ hakuOid: params.oid });

  const { translateEntity } = useTranslations();

  return <Header title={translateEntity(haku.nimi)} />;
}
