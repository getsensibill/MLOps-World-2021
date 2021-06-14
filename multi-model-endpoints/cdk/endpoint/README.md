# MME Endpoint Deployment IAC

Deploys the MME sagemaker endpoint along with dependencies:
* The deployment S3 bucket which the endpoint will load models from
* The Sagemaker Model, Endpoint Config and Endpoint resources
* Autoscaling configuration
* Cloudwatch alarms for 5xx/4xx errors along with a Lambda function to notify on Slack

The MME endpoint resources are primarily mapped to the endpoint name environment variable `ENDPOINT_NAME` which is set to `mlops-mme-v1`. Since S3 buckets have to be unique across accounts, the deployment bucket is named as `<endpoint name>-deployment-bucket-<environment name>`, e.g. `mlops-mme-v1-deployment-bucket-production`

Pre-requisites
--------------
Make sure you have access to an AWS account that has administrative privileges - especially creating IAM roles.

Setup the following:
* AWS credentials setup: Either copy the environment variables from the console or setup the AWS configuration files
* Account number: Set the `AWS_ACCOUNT_*` environment variables to to desired account numbers
* Slack URLs: If you want Slack alerts you'll need to setup a [Slack Bot](https://slack.com/intl/en-ca/help/articles/115005265703-Create-a-bot-for-your-workspace). After that set the `SLACK_ALERT_URL` to the values in the Slack dev console

Running the IAC
---------------

This IAC will typically be run once per environment, unless there are changes to endpoint configuration, (like instance type). Note that the Sagemaker Model and Endpoint Config names have a timestamp appended; this is because these resources are immutable and must be replaced on every deployment. The Endpoint resource however can be updated.

1. Clone this repository 
2. Navigate to `multi-model-endpoints/cdk/endpoint` and install dependencies: `yarn install`
3. Set the `ENVIRONMENT` environment variable to `production`/`staging` as desired (defaults to `validation`)
4. Compile the typescript files: `yarn run build`
5. Bootstrap CDK (Only once): `cdk bootstrap aws://{account number}/{region}`
6. Synthesize the Cloudformation template: `./cdk-mme.sh synth`
7. Diff with existing deployment: `./cdk-mme.sh diff`
8. Deploy the changes: `./cdk-mme.sh deploy`

Handling Instance Updates
-------------------------

The Sagemaker endpoint has a known issue where an endpoint instance cannot be updated when autoscaling is turned on. To handle that scenario do the following:
1. Turn off autoscaling by setting `config.model.scaling.enable` to `false`. 
2. Note the current number of running instances on the Sagemaker console and manually set the value under `config.model.resources.initialInstanceCount`
3. Follow the steps from the previous section to deploy the changes
4. Now update the instance type, revert changes from steps 2-3 and redeploy
