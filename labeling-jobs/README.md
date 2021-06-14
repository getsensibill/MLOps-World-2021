# SageMaker Labeling Jobs with Step Functions
This directory contains notebooks, code and data to setup a workflow for SageMaker Ground Truth Labeling Jobs

Prerequisites
-------------
You need to have an AWS account with admin access to run the code.

Export an environment variable called `$AWS_ACCOUNT` with your account number

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

Create a S3 bucket called `mlops-2021` and add the following CORS permission:
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