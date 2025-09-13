'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { showModal } from '@/components/modals/global-modal';
import { useTranslations } from '@/lib/localization/useTranslations';
import { ConfirmationGlobalModal } from '@/components/modals/confirmation-global-modal';

const onBeforeUnload = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  return true;
};

const restoreOriginalPush = (router: AppRouterInstance) => {
  window.removeEventListener('beforeunload', onBeforeUnload);
  // @ts-expect-error setting back original push function to router
  router.push = router.originalPush;
};

export function useConfirmChangesBeforeNavigation2(isDirty: boolean) {
  const router = useRouter();

  const { t } = useTranslations();

  useEffect(() => {
    if (router.push.name !== 'patched') {
      // @ts-expect-error storing original push function to the router
      router.originalPush = router.push;
    }

    if (isDirty && router.push.name !== 'patched') {
      router.push = function patched(...args) {
        showModal(ConfirmationGlobalModal, {
          title: t('lomake.tallentamattomia-muutoksia'),
          content: t('lomake.tallentamaton'),
          confirmLabel: t('lomake.jatka'),
          cancelLabel: t('yleinen.peruuta'),
          onConfirm: () => {
            restoreOriginalPush(router);
            router.push(...args);
          },
        });
      };
      window.addEventListener('beforeunload', onBeforeUnload);
    } else if (router.push.name === 'patched' && !isDirty) {
      restoreOriginalPush(router);
    }

    return () => {
      restoreOriginalPush(router);
    };
  }, [isDirty, router, t]);
}

export const useConfirmChangesBeforeNavigation = (shouldBlock: boolean, allowedRoutes: string[] = []) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAttemptingNavigation, setIsAttemptingNavigation] = useState(false);
    const [nextRoute, setNextRoute] = useState<string | null>(null);

    const originalPushRef = useRef(router.push); // Store original router.push
    const lastLocationRef = useRef<string | null>(null); // Track last known location

    const canNavigate = (url: string) => {
        const { pathname } = new URL(url, window.location.origin);
        return allowedRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));
    };

    useEffect(() => {
        const handleNavigation = (url: string) => {
            // ✅ If navigation is allowed, proceed immediately
            if (!shouldBlock || canNavigate?.(url) || url === pathname) {
                originalPushRef.current(url); // Use original router.push
                return;
            }

            // 🚧 Block navigation & ask for confirmation
            if (nextRoute !== url) {
                // Avoid setting the same route multiple times
                setIsAttemptingNavigation(true);
                setNextRoute(url);
            }
        };

        // Override router.push **only once**
        router.push = ((url, _options) => {
            handleNavigation(url);
        }) as typeof router.push;

        return () => {
            router.push = originalPushRef.current; // Restore original push
        };
    }, [shouldBlock, pathname, allowedRoutes, nextRoute]);

    // 🔹 Handle Reload Prevention
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (shouldBlock) {
                event.preventDefault();
                event.returnValue = "Are you sure you want to leave?";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [shouldBlock]);

    // 🔙 Handle Back Button with Previous Route Tracking
    useEffect(() => {
        const handleBackButton = (event: PopStateEvent) => {
            if (shouldBlock) {
                event.preventDefault();

                const previousURL = lastLocationRef.current || document.referrer || "/"; // Fallback to home if unknown
                setIsAttemptingNavigation(true);
                setNextRoute(previousURL);

                history.pushState(null, "", window.location.href); // Keep user on the same page
            }
        };

        lastLocationRef.current = pathname; // Track last known location
        history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", handleBackButton);

        return () => {
            window.removeEventListener("popstate", handleBackButton);
        };
    }, [shouldBlock, pathname]);

    const proceedNavigation = () => {
        if (nextRoute) {
            setIsAttemptingNavigation(false);
            originalPushRef.current(nextRoute); // Use original router.push
            setNextRoute(null);
        }
    };

    const cancelNavigation = () => {
        setIsAttemptingNavigation(false);
        setNextRoute(null);
    };

    return { isAttemptingNavigation, proceedNavigation, cancelNavigation };
};
