import { Outlet } from 'react-router';
import { CalculateOutlined } from '@mui/icons-material';
import { PageLayout } from '@/components/page-layout';
import { useTranslations } from '@/lib/localization/useTranslations';
import { Header } from '@/components/header';
import { IconHeaderBlock } from '@/components/icon-header-block';

export default function SeurantaLayout() {
  const { t } = useTranslations();

  return (
    <PageLayout header={<Header isHome={true} title={t('seuranta.otsikko')} />}>
      <IconHeaderBlock
        title={t('seuranta.laskennat-otsikko')}
        icon={<CalculateOutlined />}
      >
        <Outlet />
      </IconHeaderBlock>
    </PageLayout>
  );
}
