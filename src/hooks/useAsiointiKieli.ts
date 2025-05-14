import { useQuery } from '@tanstack/react-query';
import { client } from '../lib/http-client';
import { Language } from '../lib/localization/localization-types';
import { getConfiguration } from '../lib/configuration/client-configuration';

export const getAsiointiKieli = async (): Promise<Language> => {
  const config = getConfiguration();
  const response = await client.get<Language>(
    config.routes.yleiset.asiointiKieliUrl({}),
  );
  return response.data ?? 'fi';
};

export const useAsiointiKieli = () =>
  useQuery({
    queryKey: ['getAsiointiKieli'],
    queryFn: getAsiointiKieli,
    staleTime: Infinity,
  });
