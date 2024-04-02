'use client'
import { Link as MuiLink, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Haku, Tila, getAlkamisKausi } from "../lib/kouta";
import { Koodi } from '../lib/koodisto';
import { getTranslation } from '../lib/common';

export const HakuList = ({haut, hakutavat}: {haut : Haku[], hakutavat: Koodi[]}) =>{

  const getMatchingHakutapa = (hakutapaKoodiUri: string) => hakutavat.find((tapa: Koodi) => 
    hakutapaKoodiUri.startsWith(tapa.koodiUri))?.nimi.fi;

  return (
    <TableContainer sx={{ maxWidth: '80vw'}}>
      <Table
        stickyHeader
        aria-label="Haut"
      >
        <TableHead>
          <TableRow>
            <TableCell>Nimi</TableCell>
            <TableCell>Tila</TableCell>
            <TableCell>Hakutapa</TableCell>
            <TableCell>Koulutuksen alkamiskausi</TableCell>
            <TableCell>Hakukohteet</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {haut
            .map((haku: Haku) => (
              <TableRow key={haku.oid}>
                <TableCell>
                  <MuiLink href={`haku/${haku.oid}`}>{getTranslation(haku.nimi)}</MuiLink>
                </TableCell>
                <TableCell>{Tila[haku.tila]}</TableCell>
                <TableCell>{getMatchingHakutapa(haku.hakutapaKoodiUri)}</TableCell>
                <TableCell>{haku.alkamisKausiKoodiUri ? `${haku.alkamisVuosi} ${getAlkamisKausi(haku.alkamisKausiKoodiUri)}` : ''}</TableCell>
                <TableCell>0</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
