# MLOps-World-2021
Handout code for the MLOps World 2021 presentation "Deploying an E2E ML Pipeline with AWS SageMaker - What Amazon Didn't Tell You"

Pre-requisites
--------------
You need to have an AWS account with admin access to run the code.

Export an environment variable called `$AWS_ACCOUNT` with your account number

Export the default AWS Region: `export AWS_DEFAULT_REGION=us-east-1`

Export your AWS key and secret into `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` respectively

Install AWS CLI

```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```