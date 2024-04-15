'use client'

import { getTranslation } from "@/app/lib/common";
import { Hakukohde } from "@/app/lib/kouta";
import { styled } from "@mui/material";

const StyledList = styled('div')({
  maxWidth: '20vw',
  textAlign: 'left'
});

const StyledItem = styled('div')({
  '.organizationLabel': {
    fontWeight: 500
  },

  '&:nth-child(even)': {
    backgroundColor: '#f5f5f5'
  },
  '&:hover': {
    backgroundColor: '#e0f2fd'
  }
});

export const HakukohdeList = ({hakukohteet}: {hakukohteet : Hakukohde[]}) =>{

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
