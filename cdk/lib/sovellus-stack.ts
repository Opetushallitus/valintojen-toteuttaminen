import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Nextjs, NextjsOverrides } from 'cdk-nextjs-standalone';
import { PriceClass } from 'aws-cdk-lib/aws-cloudfront';

type EnvironmentName = 'untuva' | 'hahtuva' | 'pallero';

const publicHostedZones: Record<EnvironmentName, string> = {
  untuva: 'untuvaopintopolku.fi',
  hahtuva: 'hahtuvaopintopolku.fi',
  pallero: 'testiopintopolku.fi',
};

const publicHostedZoneIds: Record<EnvironmentName, string> = {
  untuva: 'Z1399RU36FG2N9',
  hahtuva: 'Z20VS6J64SGAG9',
  pallero: 'Z175BBXSKVCV3B',
};

interface ValintojenToteuttaminenStackProps extends cdk.StackProps {
  environmentName: EnvironmentName;
  skipBuild: boolean;
}

const nextJsLogGroupOverrides = (
  scope: Construct,
  environmentName: EnvironmentName,
  appName: string,
): NextjsOverrides => {
  return {
    nextjsServer: {
      functionProps: {
        logGroup: new logs.LogGroup(
          scope,
          'Valintojen Toteuttaminen NextJs Server lambda',
          {
            logGroupName: `/aws/lambda/${environmentName}-${appName}-nextjs-server`,
          },
        ),
      },
    },
    nextjsStaticAssets: {
      nextjsBucketDeploymentProps: {
        overrides: {
          functionProps: {
            logGroup: new logs.LogGroup(
              scope,
              'Valintojen Toteuttaminen NextJs Static Assets Bucket Deployment lambda',
              {
                logGroupName: `/aws/lambda/${environmentName}-${appName}-nextjs-static-assets-bucket-deployment`,
              },
            ),
          },
        },
      },
    },
    nextjsBucketDeployment: {
      functionProps: {
        logGroup: new logs.LogGroup(
          scope,
          'Valintojen Toteuttaminen NextJs Bucket Deployment lambda',
          {
            logGroupName: `/aws/lambda/${environmentName}-${appName}-nextjs-bucket-deployment`,
          },
        ),
      },
    },
    nextjsImage: {
      functionProps: {
        logGroup: new logs.LogGroup(
          scope,
          'Valintojen Toteuttaminen NextJs Image lambda',
          {
            logGroupName: `/aws/lambda/${environmentName}-${appName}-nextjs-image`,
          },
        ),
      },
    },
    nextjsRevalidation: {
      insertFunctionProps: {
        logGroup: new logs.LogGroup(
          scope,
          'Valintojen Toteuttaminen NextJs Revalidation Insert lambda',
          {
            logGroupName: `/aws/lambda/${environmentName}-${appName}-nextjs-revalidation-insert`,
          },
        ),
      },
      queueFunctionProps: {
        logGroup: new logs.LogGroup(
          scope,
          'Valintojen Toteuttaminen NextJs Revalidation Queue lambda',
          {
            logGroupName: `/aws/lambda/${environmentName}-${appName}-nextjs-revalidation-queue`,
          },
        ),
      },
    },
  };
};

export class SovellusStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ValintojenToteuttaminenStackProps,
  ) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
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
        hostedZone,
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
        hostedZone,
      },
      overrides: {
        nextjsDistribution: {
          distributionProps: {
            priceClass: PriceClass.PRICE_CLASS_100,
          },
        },
        ...nextJsLogGroupOverrides(
          this,
          props.environmentName,
          'valintojen-toteuttaminen',
        ),
      },
    });
    new cdk.CfnOutput(this, 'CloudFrontDistributionDomain', {
      value: nextjs.distribution.distributionDomain,
    });
  }
}
