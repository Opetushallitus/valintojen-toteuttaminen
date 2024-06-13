import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Nextjs } from 'cdk-nextjs-standalone';

interface ValintojenToteuttaminenStackProps extends cdk.StackProps {
  environmentName: string;
  skipBuild: boolean;
}

export class SovellusStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ValintojenToteuttaminenStackProps,
  ) {
    super(scope, id, props);

    const publicHostedZones: { [p: string]: string } = {
      hahtuva: 'hahtuvaopintopolku.fi',
      pallero: 'testiopintopolku.fi',
      untuva: 'untuvaopintopolku.fi',
    };

    const publicHostedZoneIds: { [p: string]: string } = {
      hahtuva: 'Z20VS6J64SGAG9',
      pallero: 'Z175BBXSKVCV3B',
      untuva: 'Z1399RU36FG2N9',
    };

    const zone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'PublicHostedZone',
      {
        zoneName: `${publicHostedZones[props.environmentName]}.`,
        hostedZoneId: `${publicHostedZoneIds[props.environmentName]}`,
      },
    );

    const domainName = `valintojen-toteuttaminen.${publicHostedZones[props.environmentName]}`;

    const certificate = new acm.DnsValidatedCertificate(
      this,
      'SiteCertificate',
      {
        domainName,
        hostedZone: zone,
        region: 'us-east-1', // Cloudfront only checks this region for certificates.
      },
    );

    const nextjs = new Nextjs(this, 'Nextjs', {
      nextjsPath: '..', // relative path from your project root to NextJS
      ...(props.skipBuild
        ? {
            buildCommand:
              'npx --yes open-next@^2 build -- --build-command "npm run noop"',
          }
        : {}),
      basePath: '/valintojen-toteuttaminen',
      environment: {
        STANDALONE: 'true',
        VIRKAILIJA_URL: `https://virkailija.${publicHostedZones[props.environmentName]}`,
      },
      domainProps: {
        domainName,
        certificate,
        hostedZone: zone,
      },
    });
    new cdk.CfnOutput(this, 'CloudFrontDistributionDomain', {
      value: nextjs.distribution.distributionDomain,
    });
  }
}
