import { useQuery } from '@tanstack/react-query';
import { client } from '../lib/http-client';
import { configuration } from '../lib/configuration';
import { Language } from '../lib/localization/localization-types';

export const getAsiointiKieli = async (): Promise<Language> => {
  const response = await client.get(configuration.asiointiKieliUrl);
  return response.data ?? 'fi';
};

export const useAsiointiKieli = () =>
  useQuery({
    queryKey: ['getAsiointiKieli'],
    queryFn: getAsiointiKieli,

    staleTime: Infinity,
  });
