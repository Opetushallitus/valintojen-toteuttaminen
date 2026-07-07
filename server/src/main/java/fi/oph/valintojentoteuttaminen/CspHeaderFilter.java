package fi.oph.valintojentoteuttaminen;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Asettaa Content-Security-Policy-headerin kaikille vastauksille. */
@Component
public class CspHeaderFilter extends OncePerRequestFilter {

  private static final String CSP_POLICY =
      String.join(
          "",
          "default-src 'self';",
          "connect-src 'self' https://app.tolgee.io;",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
              + " https://cdn.jsdelivr.net/npm/@tolgee/web@prerelease/dist/tolgee-in-context-tools.umd.min.js;",
          "style-src 'self' 'unsafe-inline';",
          "img-src 'self' blob: data:;",
          "font-src 'self';",
          "object-src 'none';",
          "base-uri 'self';",
          "form-action 'self';",
          "frame-ancestors 'none';",
          "block-all-mixed-content;",
          "upgrade-insecure-requests;");

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    response.setHeader("Content-Security-Policy", CSP_POLICY);
    filterChain.doFilter(request, response);
  }
}
