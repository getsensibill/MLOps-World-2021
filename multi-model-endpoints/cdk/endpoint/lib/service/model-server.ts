import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import aas = require('@aws-cdk/aws-applicationautoscaling');
import sagemaker = require('@aws-cdk/aws-sagemaker');
import moment = require('moment');
import { config } from '../config';
import { getTags } from '../common/tags';

interface ModelServerProps {
    executionRole: iam.Role
}

export class ModelServer extends cdk.Construct{
    public readonly model: sagemaker.CfnModel;
    public readonly endpointConfig: sagemaker.CfnEndpointConfig;
    public readonly endpoint: sagemaker.CfnEndpoint;
    public readonly autoScaling: aas.ScalableTarget;
    public readonly endpointConfigName: string;
    public readonly modelName: string;

    constructor(scope: cdk.Construct, id: string, props: ModelServerProps) {
        super(scope, id);

        const now = moment().format('YYYY-MM-DD-hh-mm-ss');
        this.modelName = `${config.model.endpointName}-model-${now}`;
        this.endpointConfigName = `${config.model.endpointName}-config-${now}`;


        this.model = this.setupModel(props.executionRole);
        this.endpointConfig = this.setupEndpointConfig();
        this.endpoint = this.setupEndpoint();
        this.endpoint.addDependsOn(this.endpointConfig);
        this.endpointConfig.addDependsOn(this.model);

        if (config.model.scaling.enable) {
            this.autoScaling = this.setupAutoScaling();
            this.autoScaling.node.addDependency(this.endpoint);
        }
    }

    private setupModel(executionRole: iam.Role) {
        return new sagemaker.CfnModel(this, 'ModelDef', {
            executionRoleArn: executionRole.roleArn,
            enableNetworkIsolation: config.model.network.isolate,
            modelName: this.modelName,
            primaryContainer: {
                image: config.model.resources.image,
                imageConfig: {
                    repositoryAccessMode: 'Platform'
                },
                mode: 'MultiModel',
                modelDataUrl: `s3://${config.model.data.deploymentBucket}/`,
                environment: {
                    SAGEMAKER_PROGRAM: 'inference',
                    SAGEMAKER_CONTAINER_LOG_LEVEL: '20',
                    SAGEMAKER_REGION: config.region,
                    JAVA_TOOL_OPTIONS: '-XX:-UseContainerSupport -XX:+UnlockDiagnosticVMOptions',
                    MMS_DEFAULT_WORKERS_PER_MODEL: `${config.model.resources.workersPerModel}`
                }
            },
            tags: getTags()
        });
    }

    private setupEndpointConfig() {
        return new sagemaker.CfnEndpointConfig(this, 'EndpointConfig', {
            endpointConfigName: this.endpointConfigName,
            productionVariants: [{
                instanceType: config.model.resources.instanceType,
                initialInstanceCount: config.model.resources.initialInstanceCount,
                initialVariantWeight: 1,
                modelName: this.modelName,
                variantName: 'AllTraffic'
            }],
            tags: getTags()
        });
    }

    private setupEndpoint() {
        return new sagemaker.CfnEndpoint(this, 'Endpoint', {
            endpointConfigName: this.endpointConfigName,
            endpointName: config.model.endpointName,
            tags: getTags()
        });
    }

    private setupAutoScaling() {
        const target = new aas.ScalableTarget(this, 'ApplicationAutoScaling', {
            serviceNamespace: aas.ServiceNamespace.SAGEMAKER,
            maxCapacity: config.model.scaling.maxInstances,
            minCapacity: config.model.scaling.minInstances,
            scalableDimension: 'sagemaker:variant:DesiredInstanceCount',
            resourceId: `endpoint/${config.model.endpointName}/variant/AllTraffic`
        });

        target.scaleToTrackMetric('InvocationTracking', {
            targetValue: config.model.scaling.scaleTargetInvocations,
            scaleInCooldown: cdk.Duration.seconds(config.model.scaling.scaleInCooldown),
            scaleOutCooldown: cdk.Duration.seconds(config.model.scaling.scaleOutCooldown),
            predefinedMetric: aas.PredefinedMetric.SAGEMAKER_VARIANT_INVOCATIONS_PER_INSTANCE
        });

        return target;
    }
}