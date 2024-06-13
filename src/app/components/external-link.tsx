import { DOMAIN } from '@/app/lib/configuration';
import { OpenInNew } from '@mui/icons-material';
import { Link } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';

export type ExternalLinkProps = {
  name: string;
  href: string;
  noIcon?: boolean;
};

export const ExternalLink = ({ name, href, noIcon }: ExternalLinkProps) => {
  const { t } = useTranslations();
  return (
    // TODO: Korjaa nextjs-teemaan komponentti absoluuttisille linkeille (next.js-linkki vain suhteellisille linkeille)
    <Link component="a" target="_blank" href={`${DOMAIN}/${href}`}>
      {name}{' '}
      {!noIcon && (
        <OpenInNew
          sx={{ verticalAlign: 'middle', width: '20px', height: '20px' }}
          aria-label={t('yleinen.ulkoinenlinkki')}
        />
      )}
    </Link>
  );
};
