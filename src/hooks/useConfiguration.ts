'use client';

import { ConfigurationContext } from '@/components/providers/configuration-provider';
import { getConfigUrl } from '@/lib/configuration/configuration-utils';
import { use } from 'react';

export const useConfiguration = () => {
  const { configuration } = use(ConfigurationContext);
  return {
    configuration,
    getConfigUrl,
  };
};
