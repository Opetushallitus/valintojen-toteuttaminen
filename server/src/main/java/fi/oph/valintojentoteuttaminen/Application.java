package fi.oph.valintojentoteuttaminen;

import ch.qos.logback.access.jetty.RequestLogImpl;
import org.eclipse.jetty.server.RequestLog;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.jetty.JettyServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }

  @Bean
  public ConfigurableServletWebServerFactory webServerFactory() {
    JettyServletWebServerFactory factory = new JettyServletWebServerFactory();
    factory.addServerCustomizers(server -> server.setRequestLog(requestLog()));
    return factory;
  }

  private static RequestLog requestLog() {
    RequestLogImpl requestLog = new RequestLogImpl();
    String logbackAccess = System.getProperty("logback.access");
    if (logbackAccess != null) {
      requestLog.setFileName(logbackAccess);
    } else {
      System.out.println(
          "Jetty access log is printed to console, use -Dlogback.access to set configuration file");
      requestLog.setResource("/logback-access.xml");
    }
    requestLog.start();
    return requestLog;
  }
}
