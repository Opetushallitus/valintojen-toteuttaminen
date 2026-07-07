import { Header } from '@/components/header';
import { useHaku } from '@/lib/kouta/useHaku';
import { useTranslations } from '@/lib/localization/useTranslations';
import { useRequiredParams } from '@/hooks/useRequiredParams';

export function HakuHeader() {
  const { oid } = useRequiredParams<{ oid: string }>();
  const { data: haku } = useHaku({ hakuOid: oid });

  const { translateEntity } = useTranslations();

  return <Header title={translateEntity(haku.nimi)} />;
}
