#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SovellusStack } from '../lib/sovellus-stack';

const app = new cdk.App();
const environmentName = app.node.tryGetContext('environment');

new SovellusStack(app, 'SovellusStack', {
  stackName: `${environmentName}-valintojen-toteuttaminen`,
  environmentName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
