# SageMaker Labeling Jobs with Step Functions
This directory contains notebooks, code and data to setup a workflow for SageMaker Ground Truth Labeling Jobs

Prerequisites
-------------
You need to have an AWS account with admin access to run the code.

Export an environment variable called `$AWS_ACCOUNT` with your account number
Export the default AWS Region: `export AWS_DEFAULT_REGION=us-east-1`

Create an IAM role called `MLOps2021Role` with the following policies:
* AWSLambdaRole
* AmazonSageMakerFullAccess
* AWSStepFunctionsFullAccess
* AmazonS3FullAccess
(NOTE: For a production pipeline the permissions would be much narrower)

Add the following trusted identities:
* sagemaker.amazonaws.com
* states.amazonaws.com
* lambda.amazonaws.com

Create a S3 bucket and add the following CORS permission:
```
[
    {
        "AllowedHeaders": [],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

Export the environment variable `LABELING_S3_BUCKET` with the bucket name

Ensure you have the following utilities installed:
- zip