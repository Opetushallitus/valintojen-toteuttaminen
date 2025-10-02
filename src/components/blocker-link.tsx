import { useNavigationBlocker } from '@/hooks/useNavigationBlocker';
import { useTranslations } from '@/lib/localization/useTranslations';
import Link, { type LinkProps } from 'next/link';
import { showModal } from './modals/global-modal';
import { ConfirmationGlobalModal } from './modals/confirmation-global-modal';
import { useRouter } from 'next/navigation';

export const BlockerLink = ({
  children,
  useBlank = false,
  ...props
}: LinkProps & { children: React.ReactNode; useBlank?: boolean }) => {
  const { isBlocked, unblock } = useNavigationBlocker();
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
              unblock();
              router.replace(
                typeof href === 'string' ? href : String(href.pathname ?? ''),
              );
            },
          });
        }
      }}
      target={useBlank ? '_blank' : '_self'}
    >
      {children}
    </Link>
  );
};

export const BlockerLinkWithBlank = ({
  children,
  ...props
}: LinkProps & { children: React.ReactNode }) => {
  return (
    <BlockerLink {...props} useBlank={true}>
      {children}
    </BlockerLink>
  );
};
