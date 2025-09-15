import { useNavigationBlocker } from '@/hooks/useNavigationBlocker';
import { useTranslations } from '@/lib/localization/useTranslations';
import Link, { type LinkProps } from 'next/link';
import { showModal } from './modals/global-modal';
import { ConfirmationGlobalModal } from './modals/confirmation-global-modal';
import { useRouter } from 'next/navigation';

export const InternalLink = ({
  children,
  ...props
}: LinkProps & { children: React.ReactNode }) => {
  const { isBlocked, setIsBlocked } = useNavigationBlocker();
  const router = useRouter();

  const { t } = useTranslations();
  const { href } = props;

  return (
    <Link
      {...props}
      onNavigate={(e) => {
        if (isBlocked && href) {
          e.preventDefault();
          showModal(ConfirmationGlobalModal, {
            title: t('lomake.tallentamattomia-muutoksia'),
            content: t('lomake.tallentamaton'),
            confirmLabel: t('lomake.jatka'),
            cancelLabel: t('yleinen.peruuta'),
            onConfirm: () => {
              setIsBlocked(false);
              router.replace(
                typeof href === 'string' ? href : String(href.pathname ?? ''),
              );
            },
          });
        }
      }}
    >
      {children}
    </Link>
  );
};
