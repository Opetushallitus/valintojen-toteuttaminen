import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { EnvironmentName, publicHostedZones } from './constants';

export class HostedZoneStack extends cdk.Stack {
  public readonly hostedZone: route53.IHostedZone;

  constructor(
    scope: cdk.App,
    id: string,
    props: cdk.StackProps,
    environmentName: EnvironmentName,
  ) {
    super(scope, id, props);

    this.hostedZone = route53.HostedZone.fromLookup(this, 'PublicHostedZone', {
      domainName: publicHostedZones[environmentName],
    });
  }
}
