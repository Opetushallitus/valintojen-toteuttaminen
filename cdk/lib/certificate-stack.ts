import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface ValintojenToteuttaminenCertificateStackProps extends cdk.StackProps {
  domain: string;
  hostedZone: route53.IHostedZone;
}

export class ValintojenToteuttaminenCertificateStack extends cdk.Stack {
  readonly certificate: acm.ICertificate;
  constructor(
    scope: Construct,
    id: string,
    props: ValintojenToteuttaminenCertificateStackProps,
  ) {
    super(scope, id, props);

    this.certificate = new acm.Certificate(this, 'SiteCertificate', {
      domainName: props.domain,
      validation: acm.CertificateValidation.fromDns(props.hostedZone),
    });
  }
}
