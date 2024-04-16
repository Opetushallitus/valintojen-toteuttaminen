'use client'

import { getTranslation } from "@/app/lib/common";
import { getHakukohteet } from "@/app/lib/kouta";
import { Hakukohde } from "@/app/lib/kouta-types";
import { styled } from "@mui/material";
import { useSuspenseQuery } from "@tanstack/react-query";

const StyledList = styled('div')({
  maxWidth: '20vw',
  textAlign: 'left'
});

const StyledItem = styled('div')({
  '.organizationLabel': {
    fontWeight: 500
  },

  '&:nth-of-type(even)': {
    backgroundColor: '#f5f5f5'
  },
  '&:hover': {
    backgroundColor: '#e0f2fd'
  }
});

export const HakukohdeList = ({oid}: {oid: string}) =>{

  const { data: hakukohteet } = useSuspenseQuery({
    queryKey: ["getHakukohteet", oid],
    queryFn: () => getHakukohteet(oid),
  });

    return (
      <StyledList>
        {hakukohteet.map((hk: Hakukohde) => 
          <StyledItem key={hk.oid}>
            <p title={hk.organisaatioOid} className="organizationLabel">{getTranslation(hk.organisaatioNimi)}</p>
            <p title={hk.oid}>{getTranslation(hk.nimi)}</p>
          </StyledItem>)}
      </StyledList>
    );
}

export default HakukohdeList