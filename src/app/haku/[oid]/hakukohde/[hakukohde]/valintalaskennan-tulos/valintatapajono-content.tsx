'use client';
import { Button, Box, ButtonProps } from '@mui/material';
import { useTranslations } from '@/app/hooks/useTranslations';
import {
  JonoSijaWithHakijaInfo,
  LaskettuJonoWithHakijaInfot,
  LaskettuValinnanVaihe,
  LaskettuValintatapajono,
  muutaSijoittelunStatus,
} from '@/app/lib/valintalaskenta-service';
import { OPH_ORGANIZATION_OID } from '@/app/lib/constants';
import React from 'react';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { useHakukohde } from '@/app/hooks/useHakukohde';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ValintatapajonoAccordion } from './valintatapajono-accordion';
import { useJonosijatSearch } from '@/app/hooks/useJonosijatSearch';
import { TablePaginationWrapper } from '@/app/components/table/table-pagination-wrapper';
import { LaskettuValintatapajonoTable } from './laskettu-valintatapajono-table';
import { ValintatapajonoAccordionTitle } from './valintatapajono-accordion-title';
import { ClientSpinner } from '@/app/components/client-spinner';

const PaginatedValintatapajonoTable = ({
  jonoId,
  jonosijat,
}: {
  jonoId: string;
  jonosijat: Array<JonoSijaWithHakijaInfo>;
}) => {
  const { results, pageResults, sort, setSort, pageSize, setPage, page } =
    useJonosijatSearch(jonoId, jonosijat);

  return (
    <TablePaginationWrapper
      totalCount={results?.length ?? 0}
      countTranslationKey="jonosijat.maara"
      pageSize={pageSize}
      setPageNumber={setPage}
      pageNumber={page}
      countHidden={true}
    >
      <LaskettuValintatapajonoTable
        setSort={setSort}
        sort={sort}
        jonoId={jonoId}
        jonosijat={pageResults}
      />
    </TablePaginationWrapper>
  );
};

const SijoitteluButton = ({
  isLoading = false,
  disabled,
  startIcon,
  ...props
}: ButtonProps & { isLoading?: boolean }) => {
  return (
    <Button
      {...props}
      disabled={isLoading || disabled}
      variant="outlined"
      startIcon={
        isLoading ? <ClientSpinner color="inherit" size="24px" /> : startIcon
      }
    />
  );
};

const useSijoitteluStatusMutation = (hakukohdeOid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jono,
      status,
    }: {
      jono: LaskettuValintatapajono;
      status: boolean;
    }) => {
      await muutaSijoittelunStatus({ jono, status });
      queryClient.setQueryData(
        ['getLasketutValinnanVaiheet', hakukohdeOid],
        (vaiheet: Array<LaskettuValinnanVaihe>) =>
          vaiheet.map((vaihe) => ({
            ...vaihe,
            valintatapajonot: vaihe.valintatapajonot?.map((oldJono) => ({
              ...oldJono,
              valmisSijoiteltavaksi:
                jono.oid === oldJono.oid
                  ? status
                  : oldJono.valmisSijoiteltavaksi,
            })),
          })),
      );
    },
    onError: (e) => {
      // TODO: Toast-notifikaatio (OK-585)
      window.alert('Jonon sijoittelun statuksen muuttamisesa tapahtui virhe!');
      console.error(e);
    },
  });
};

export const ValintatapajonoContent = ({
  hakukohdeOid,
  valinnanVaihe,
  jono,
}: {
  hakukohdeOid: string;
  valinnanVaihe: LaskettuValinnanVaihe;
  jono: LaskettuJonoWithHakijaInfot;
}) => {
  const { t } = useTranslations();

  const { data: permissions } = useUserPermissions();

  const { data: hakukohde } = useHakukohde({ hakukohdeOid });

  const hasOphUpdate =
    permissions.writeOrganizations.includes(OPH_ORGANIZATION_OID);

  const hasOrgCrud = permissions.crudOrganizations.includes(
    hakukohde.organisaatioOid,
  );
  const sijoittelunStatusMutation = useSijoitteluStatusMutation(hakukohdeOid);

  return (
    <Box key={jono.oid} width="100%">
      <ValintatapajonoAccordion
        id={valinnanVaihe.valinnanvaiheoid}
        title={
          <ValintatapajonoAccordionTitle
            valinnanVaihe={valinnanVaihe}
            jono={jono}
          />
        }
      >
        <Box paddingTop={2} paddingBottom={1}>
          {!jono.valmisSijoiteltavaksi && jono.siirretaanSijoitteluun && (
            <SijoitteluButton
              isLoading={sijoittelunStatusMutation.isPending}
              disabled={!hasOphUpdate && !hasOrgCrud}
              onClick={() =>
                sijoittelunStatusMutation.mutate({ jono, status: true })
              }
            >
              {t('valintalaskennan-tulos.siirra-jono-sijoitteluun')}
            </SijoitteluButton>
          )}
          {jono.valmisSijoiteltavaksi && jono.siirretaanSijoitteluun && (
            <SijoitteluButton
              isLoading={sijoittelunStatusMutation.isPending}
              disabled={!hasOphUpdate}
              onClick={() =>
                sijoittelunStatusMutation.mutate({ jono, status: false })
              }
            >
              {t('valintalaskennan-tulos.poista-jono-sijoittelusta')}
            </SijoitteluButton>
          )}
        </Box>
        <PaginatedValintatapajonoTable
          jonoId={jono.valintatapajonooid}
          jonosijat={jono.jonosijat}
        />
      </ValintatapajonoAccordion>
    </Box>
  );
};
