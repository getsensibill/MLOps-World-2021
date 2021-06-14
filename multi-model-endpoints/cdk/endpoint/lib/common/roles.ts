import iam = require('@aws-cdk/aws-iam');
import cdk = require('@aws-cdk/core');

import { config } from '../config';


export function createSagemakerRole(scope: cdk.Construct) {
    return new iam.Role(scope, 'SagemakerRole', {
        assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
        inlinePolicies: {
            CreateModel: new iam.PolicyDocument({
                statements: getBaseSagemakerPolicies()
                    .concat(getS3Policies())
                    .concat(getEcrPolicies())
            })
        }
    });
}

function getBaseSagemakerPolicies() {
    return [new iam.PolicyStatement({
        actions: [
            'cloudwatch:PutMetricData',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
            'logs:CreateLogGroup',
            'logs:DescribeLogStreams',
            'ecr:GetAuthorizationToken'
        ],
        resources: ['*']
    })];
}


function getS3Policies() {
    return [
        new iam.PolicyStatement({
            actions: [
                's3:GetObject',
            ],
            resources: [`arn:aws:s3:::${config.model.data.deploymentBucket}/*`] // Can only read deployment bucket
    }),
        new iam.PolicyStatement({
            actions: [
                's3:ListBucket',
            ],
            resources: [`arn:aws:s3:::${config.model.data.deploymentBucket}`] // Can only read deployment bucket
        })
    ];
}

function getEcrPolicies() {
    return [new iam.PolicyStatement({
        actions: [
            'ecr:BatchCheckLayerAvailability',
            'ecr:GetDownloadUrlForLayer',
            'ecr:BatchGetImage',
            'ecr:GetAuthorizationToken'
        ],
        resources: ['*']
    })];
}