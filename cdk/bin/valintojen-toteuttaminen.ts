#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ValintojenToteuttaminenSovellusStack } from '../lib/sovellus-stack';
import { ValintojenToteuttaminenCertificateStack } from '../lib/certificate-stack';
import { HostedZoneStack } from '../lib/hosted-zone-stack';
import { EnvironmentName, publicHostedZones } from '../lib/constants';

const app = new cdk.App();
const environmentName: EnvironmentName = app.node.tryGetContext('environment');
const account = process.env.CDK_DEFAULT_ACCOUNT;
const envEU = { account, region: 'eu-west-1' };
const envUS = { account, region: 'us-east-1' };

const domainName = `valintojen-toteuttaminen.${publicHostedZones[environmentName]}`;

const hostedZoneStack = new HostedZoneStack(
  app,
  'HostedZoneStack',
  { env: envEU },
  environmentName,
);

const certificateStack = new ValintojenToteuttaminenCertificateStack(
  app,
  'ValintojenToteuttaminenCertificateStack',
  {
    env: envUS,
    stackName: `${environmentName}-valintojen-toteuttaminen-certificate`,
    domain: domainName,
    hostedZone: hostedZoneStack.hostedZone,
    crossRegionReferences: true,
  },
);

new ValintojenToteuttaminenSovellusStack(app, 'SovellusStack', {
  stackName: `${environmentName}-valintojen-toteuttaminen`,
  environmentName,
  env: {
    account,
    region: process.env.CDK_DEFAULT_REGION,
  },
  hostedZone: hostedZoneStack.hostedZone,
  certificate: certificateStack.certificate,
  crossRegionReferences: true,
  domainName: domainName,
});
