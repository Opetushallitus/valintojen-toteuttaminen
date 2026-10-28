import { Outlet } from 'react-router';
import { HistoryOutlined } from '@mui/icons-material';
import { PageLayout } from '@/components/page-layout';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Header } from '@/components/header';
import { IconHeaderBlock } from '@/components/icon-header-block';

export default function ValintalaskentahistoriaLayout() {
  const { t } = useTranslations();

  return (
    <PageLayout
      header={
        <Header isHome={true} title={t('valintalaskentahistoria.otsikko')} />
      }
    >
      <IconHeaderBlock
        title={t('valintalaskentahistoria.historia-otsikko')}
        icon={<HistoryOutlined />}
      >
        <Outlet />
      </IconHeaderBlock>
    </PageLayout>
  );
}
