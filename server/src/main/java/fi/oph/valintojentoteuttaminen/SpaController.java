package fi.oph.valintojentoteuttaminen;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Palauttaa index.html:n kaikille käyttöliittymän reiteille, jotta selaimen osoiterivillä olevat
 * syvälinkit toimivat (client-side routing hoitaa varsinaisen reitityksen).
 */
@Controller
public class SpaController {

  @GetMapping(value = {"/", "/haku/**", "/seuranta/**"})
  public String index() {
    return "forward:/index.html";
  }
}
