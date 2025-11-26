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
import { EnvironmentName, publicHostedZones } from './constants';

interface ValintojenToteuttaminenStackProps extends cdk.StackProps {
  environmentName: EnvironmentName;
  hostedZone: route53.IHostedZone;
  certificate: acm.ICertificate;
  domainName: string;
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
  hahtuva: {},
  pallero: {},
  sade: {},
};

export class ValintojenToteuttaminenSovellusStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ValintojenToteuttaminenStackProps,
  ) {
    super(scope, id, props);

    const OPEN_NEXT_SERVER_CACHE_POLICY_ID = StringParameter.valueFromLookup(
      this,
      props.environmentName === 'sade'
        ? '/prod/NextJs/serverCachePolicyId'
        : '/dev/NextJs/serverCachePolicyId',
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
        domainName: props.domainName,
        certificate: props.certificate,
        hostedZone: props.hostedZone,
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
