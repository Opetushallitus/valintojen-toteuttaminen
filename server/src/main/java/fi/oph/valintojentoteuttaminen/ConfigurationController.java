package fi.oph.valintojentoteuttaminen;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tarjoaa frontendille ympäristökohtaisen konfiguraation. Frontend rakentaa palvelujen osoitteet
 * virkailija-domainista (ks. src/lib/configuration/load-configuration.ts).
 */
@RestController
@RequestMapping("/rest/config")
public class ConfigurationController {

  private final String virkailijaUrl;

  public ConfigurationController(@Value("${host.virkailija}") String hostVirkailija) {
    this.virkailijaUrl = "https://" + hostVirkailija;
  }

  @GetMapping(value = "/frontProperties", produces = MediaType.APPLICATION_JSON_VALUE)
  public Map<String, String> frontProperties() {
    return Map.of("virkailijaUrl", virkailijaUrl);
  }
}
