import * as cdk from 'aws-cdk-lib';
import { Duration, Fn } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as shield from 'aws-cdk-lib/aws-shield';
import path = require('path');

interface ValintojenToteuttaminenStackProps extends cdk.StackProps {
  environmentName: string;
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
      untuva: '',
    };

    const webAclIds: { [p: string]: string } = {
      hahtuva: `arn:aws:wafv2:us-east-1:${this.account}:global/webacl/dev-manual-web-acl/d65d35e9-a67b-478a-a7ca-48af3a5e8479`,
      pallero: `arn:aws:wafv2:us-east-1:${this.account}:global/webacl/dev-manual-web-acl/d65d35e9-a67b-478a-a7ca-48af3a5e8479`,
      untuva: '',
    };

    /**const vpc = ec2.Vpc.fromVpcAttributes(this, "VPC", {
      vpcId: cdk.Fn.importValue(`${props.environmentName}-Vpc`),
      availabilityZones: [
        cdk.Fn.importValue(`${props.environmentName}-SubnetAvailabilityZones`),
      ],
      privateSubnetIds: [
        cdk.Fn.importValue(`${props.environmentName}-PrivateSubnet1`),
        cdk.Fn.importValue(`${props.environmentName}-PrivateSubnet2`),
        cdk.Fn.importValue(`${props.environmentName}-PrivateSubnet3`),
      ],
    });**/

    // staattinen saitti
    const staticBucket = new s3.Bucket(this, 'StaticFiles', {
      bucketName: `${props.environmentName}-valintojen-toteuttaminen-static`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // toistaiseksi ei tarvitse jättää
      autoDeleteObjects: true,
    });

    const lambdaAdapterLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'LambdaAdapterLayerX86',
      `arn:aws:lambda:${this.region}:753240598075:layer:LambdaAdapterLayerX86:19`,
    );

    const valintojenToteuttaminenFunction = new lambda.Function(
      this,
      'NextCdkFunction',
      {
        functionName: `${props.environmentName}-valintojen-toteuttaminen`,
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'run.sh',
        memorySize: 1024,
        timeout: Duration.seconds(60),
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../.next/', 'standalone'),
        ),
        architecture: lambda.Architecture.X86_64,
        environment: {
          AWS_LAMBDA_EXEC_WRAPPER: '/opt/bootstrap',
          RUST_LOG: 'info',
          PORT: '8080',
        },
        layers: [lambdaAdapterLayer],
      },
    );

    const valintojenToteuttaminenFunctionUrl =
      valintojenToteuttaminenFunction.addFunctionUrl({
        authType: FunctionUrlAuthType.NONE,
      });

    const nextJsS3Deployment = new s3deploy.BucketDeployment(
      this,
      'NextJsStaticDeployment',
      {
        sources: [s3deploy.Source.asset('../../.next/static')],
        destinationBucket: staticBucket,
        destinationKeyPrefix: 'static/_next/static',
      },
    );

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
      this,
      'cloudfront-OAI',
      {
        comment: `OAI for valintojen toteuttaminen`,
      },
    );
    staticBucket.grantRead(cloudfrontOAI);

    const zone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'PublicHostedZone',
      {
        zoneName: `${publicHostedZones[props.environmentName]}.`,
        hostedZoneId: `${publicHostedZoneIds[props.environmentName]}`,
      },
    );

    const certificate = new acm.DnsValidatedCertificate(
      this,
      'SiteCertificate',
      {
        domainName: `valintojen-toteuttaminen.${publicHostedZones[props.environmentName]}`,
        hostedZone: zone,
        region: 'us-east-1', // Cloudfront only checks this region for certificates.
      },
    );

    const noCachePolicy = new cloudfront.CachePolicy(
      this,
      `noCachePolicy-${props.environmentName}-valintojen-toteuttaminen`,
      {
        cachePolicyName: `noCachePolicy-${props.environmentName}-valintojen-toteuttaminen`,
        defaultTtl: cdk.Duration.minutes(0),
        minTtl: cdk.Duration.minutes(0),
        maxTtl: cdk.Duration.minutes(0),
      },
    );

    const originRequestPolicy = new cloudfront.OriginRequestPolicy(
      this,
      'LambdaOriginRequestPolicy',
      {
        originRequestPolicyName: `originRequestPolicy-${props.environmentName}-valintojen-toteuttaminen`,
        cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
        queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
        headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
          'Accept',
          'Content-Type',
          'Content-Type-Original',
        ), // host header must be excluded???
      },
    );

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      certificate: certificate,
      domainNames: [
        `valintojen-toteuttaminen.${publicHostedZones[props.environmentName]}`,
      ],
      defaultRootObject: 'index.html',
      webAclId: webAclIds[props.environmentName],
      defaultBehavior: {
        origin: new cloudfront_origins.HttpOrigin(
          Fn.select(2, Fn.split('/', valintojenToteuttaminenFunctionUrl.url)),
          {},
        ),
        cachePolicy: noCachePolicy,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        originRequestPolicy,
      },
      additionalBehaviors: {
        '/valintojen-toteuttaminen/*': {
          origin: new cloudfront_origins.HttpOrigin(
            Fn.select(2, Fn.split('/', valintojenToteuttaminenFunctionUrl.url)),
            {},
          ),
          cachePolicy: noCachePolicy,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          originRequestPolicy,
        },
        '/static/*': {
          origin: new cloudfront_origins.S3Origin(staticBucket, {
            originAccessIdentity: cloudfrontOAI,
          }),
          cachePolicy: noCachePolicy,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    });

    new shield.CfnProtection(this, 'DistributionShieldProtection', {
      name: `valintojen-toteuttaminen-${props.environmentName} cloudfront distribution`,
      resourceArn: `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
    });

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this, 'SiteAliasRecord', {
      recordName: `valintojen-toteuttaminen.${publicHostedZones[props.environmentName]}`,
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(distribution),
      ),
      zone,
    });
  }
}
