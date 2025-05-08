'use client';

import { client } from "@/lib/http-client";
import { useQuery } from "@tanstack/react-query";
import { isNullish } from "remeda";

declare global {
  interface Window {
    configuration?: Record<string, any>;
  }
}

export const getConfiguration = async (): Promise<Record<string, any>> => {
  if (isNullish(window?.configuration)) {
    const response = await client.get<Record<string, string>>("valintojen-toteuttaminen/configuration");
    console.log('fetched configuration data', );
    window.configuration = response.data;
  }
  return window.configuration;
};

export const useConfiguration = () =>
  useQuery({
    queryKey: ['getConfiguration'],
    queryFn: getConfiguration,
    staleTime: Infinity,
  });