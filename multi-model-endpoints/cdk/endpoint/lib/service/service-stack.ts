import * as cdk from '@aws-cdk/core';
import iam = require('@aws-cdk/aws-iam');
import s3 = require('@aws-cdk/aws-s3');
import { ModelServer } from './model-server';
import { createSagemakerRole } from '../common/roles';
import { config } from '../config';
import { EndpointMonitor } from './endpoint-monitor';

export class ServiceStack extends cdk.Stack {
    public readonly executionRole: iam.Role;
    public readonly modelServer: ModelServer;
    public readonly deploymentBucket: s3.Bucket;
    public readonly endpointMonitor: EndpointMonitor;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.executionRole = createSagemakerRole(this);
        this.deploymentBucket = this.setupDeploymentBucket();
        this.modelServer = new ModelServer(this, 'ModelServer', {
            executionRole: this.executionRole
        });
        this.endpointMonitor = new EndpointMonitor(this, 'EndpointMonitor');

        this.modelServer.model.addDependsOn(this.deploymentBucket.node.defaultChild as s3.CfnBucket);
    }

    private setupDeploymentBucket() {
        return new s3.Bucket(this, 'DeploymentBucket', {
            bucketName: config.model.data.deploymentBucket,
            encryption: s3.BucketEncryption.KMS_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            blockPublicAccess: {
                blockPublicAcls: true,
                blockPublicPolicy: true,
                ignorePublicAcls: true,
                restrictPublicBuckets: true
            }
        });
    }
}
