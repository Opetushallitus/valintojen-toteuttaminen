#!/usr/bin/env bash

set -eo pipefail

if [ $# == 0  ] || [ $# -gt 3 ] 
then
    echo 'please provide 1-3 arguments. Use -h or --help for usage information.'
    exit 0
fi

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -h | --help | help )
    echo '''
Usage: deploy.sh [-h] [-d] environment deploy/build/loadup/loaddown

Light weight version of cdk.sh in cloud-base 

positional arguments:
  deploy                builds and deploys the stack to target environment, environment must be supplied.
  build                 only builds the Lambda & synthesizes CDK (useful when developing)
  environment           Environment name (e.g. pallero)

optional arguments:
  -h, --help            Show this help message and exit
  -d, --dependencies    Clean and install dependencies before deployment (i.e. run npm ci)
  '''
    exit 0
    ;;

    deploy)
    deploy="true"
    shift
    ;;

    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done

git_root=$(git rev-parse --show-toplevel)

if [[ "${deploy}" == "true" ]]; then
    environment=${POSITIONAL[~-1]}

   echo "Building Lambda code, synhesizing CDK code and deploying to environment: $environment"
   cd "${git_root}/cdk/"
   cdk deploy SovellusStack -c "environment=$environment"
fi
