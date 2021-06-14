import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import iam = require('@aws-cdk/aws-iam');

import path = require('path');
import { config } from '../config';

export type MetricName = 'Invocation4XXErrors' | 'Invocation5XXErrors';

export function createMonitoringLambda(scope: cdk.Construct, lambdaId: string, metricName: MetricName) {

    const lambdaFunction = new lambda.Function(scope, lambdaId, {
        code: new lambda.AssetCode(path.join(__dirname, '..', 'lambda', 'monitoringLambda')),
        handler: 'index.handler',
        memorySize: 128,
        timeout: cdk.Duration.seconds(5),
        runtime: lambda.Runtime.NODEJS_12_X,
        environment: {
            WEBHOOK_HOSTNAME: config.webHooks[metricName].hostName,
            WEBHOOK_PATH: config.webHooks[metricName].path
        }
    });

    const invokePermission : lambda.Permission = {
        principal: new iam.ServicePrincipal('sns.amazonaws.com'),
        action: 'lambda:invokeFunction'
    };
    lambdaFunction.addPermission('SnsInvokePermission', invokePermission);

    return lambdaFunction;
}