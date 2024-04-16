import { useQuery } from "@tanstack/react-query";
import { client } from "../http-client";
import { configuration } from "../configuration";

export const getAsiointiKieli = () => {
  return client.get(configuration.asiointiKieliUrl);
};

export const useAsiointiKieli = () =>
  useQuery({
    queryKey: ["getAsiointiKieli"],
    queryFn: getAsiointiKieli,
    staleTime: Infinity,
  });
