import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import {
  Nextjs,
  NextjsOverrides,
  OptionalFunctionProps,
} from 'cdk-nextjs-standalone';
import { CachePolicy, PriceClass } from 'aws-cdk-lib/aws-cloudfront';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

type EnvironmentName = 'untuva' | 'hahtuva' | 'pallero' | 'sade';

const publicHostedZones: Record<EnvironmentName, string> = {
  untuva: 'untuvaopintopolku.fi',
  hahtuva: 'hahtuvaopintopolku.fi',
  pallero: 'testiopintopolku.fi',
  sade: 'opintopolku.fi',
};

const publicHostedZoneIds: Record<EnvironmentName, string> = {
  untuva: 'Z1399RU36FG2N9',
  hahtuva: 'Z20VS6J64SGAG9',
  pallero: 'Z175BBXSKVCV3B',
  sade: 'ZNMCY72OCXY4M',
};

interface ValintojenToteuttaminenStackProps extends cdk.StackProps {
  environmentName: EnvironmentName;
}

const nameFunctionProps = (
  scope: Construct,
  environmentName: EnvironmentName,
  appName: string,
  lambdaName: string,
  logGroupOptions?: logs.LogGroupProps,
): OptionalFunctionProps => {
  const id = `${environmentName}-${appName}-${lambdaName}`;
  return {
    functionName: id,
    logGroup: new logs.LogGroup(scope, id, {
      logGroupName: `/aws/lambda/${id}`,
      retention: logs.RetentionDays.INFINITE,
      ...logGroupOptions,
    }),
  };
};

const nameOverrides = (
  scope: Construct,
  environmentName: EnvironmentName,
  appName: string,
): NextjsOverrides => {
  return {
    nextjsServer: {
      functionProps: nameFunctionProps(
        scope,
        environmentName,
        appName,
        'nextjs-server',
      ),
    },
  };
};

const envOverrides = {
  untuva: {},
  hahtuva: {
    FEATURE_VALINTALASKENTAKERRALLA_VANHA: 'true',
  },
  pallero: {},
  sade: {
    FEATURE_VALINTALASKENTAKERRALLA_VANHA: 'true',
  },
};

export class SovellusStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ValintojenToteuttaminenStackProps,
  ) {
    super(scope, id, props);

    const OPEN_NEXT_SERVER_CACHE_POLICY_ID = StringParameter.valueFromLookup(
      this,
      '/dev/NextJs/serverCachePolicyId',
    );

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
      basePath: '/valintojen-toteuttaminen',
      environment: {
        STANDALONE: 'true',
        VIRKAILIJA_URL: `https://virkailija.${publicHostedZones[props.environmentName]}`,
        DEPLOY_VIRKAILIJA_URL: `https://virkailija.${publicHostedZones[props.environmentName]}`,
        ...envOverrides[props.environmentName],
      },
      domainProps: {
        domainName,
        certificate,
        hostedZone,
      },
      overrides: {
        nextjsDistribution: {
          serverBehaviorOptions: {
            cachePolicy: { cachePolicyId: OPEN_NEXT_SERVER_CACHE_POLICY_ID },
          },
          imageBehaviorOptions: {
            // We don't need image optimization, so doesn't matter what cache policy we use
            // Using a managed policy so we don't add useless cache policies.
            cachePolicy: CachePolicy.CACHING_DISABLED,
          },
          distributionProps: {
            priceClass: PriceClass.PRICE_CLASS_100,
            enableIpv6: false,
          },
        },
        ...nameOverrides(
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
