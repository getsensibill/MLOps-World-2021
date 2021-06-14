import lodash = require('lodash');


type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

type IEnvironment = 'production' | 'staging' | 'validation';

function pickConfig<T>(defaultConfig: T, envConfig: RecursivePartial<T>): T {
    return lodash.defaultsDeep({}, envConfig, defaultConfig);
}

/* staging/production/validation */
const environment = (process.env.ENVIRONMENT || 'validation') as IEnvironment;
const endpointName = process.env.ENDPOINT_NAME || 'mme-endpoint';
const region = process.env.AWS_REGION || 'us-east-1';

const accountConfig = {
    default: {id: process.env.AWS_ACCOUNT},
    staging: {id: process.env.AWS_ACCOUNT_STAGING || process.env.AWS_ACCOUNT},
    production: {id: process.env.AWS_ACCOUNT_PRODUCTION || process.env.AWS_ACCOUNT},
    validation: {id: process.env.AWS_ACCOUNT_VALIDATION || process.env.AWS_ACCOUNT},
};


const webHookConfig = {
    default: {
        Invocation4XXErrors: {
            hostName: "hooks.slack.com",
            path: process.env.SLACK_ALERT_URL || ""
        },
        Invocation5XXErrors: {
            hostName: "hooks.slack.com",
            path: process.env.SLACK_ALERT_URL || ""
        }
    },
    production: {
        
    },
    staging: {
        
    },
    validation: {

    }
};

const modelConfig = {
    default: {
        endpointName,
        resources: {
            image: `763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:${process.env.FRAMEWORK_VERSION || '1.5.1-cpu-py36-ubuntu16.04'}`,
            instanceType: 'ml.r5.xlarge',
            initialInstanceCount: 1,
            workersPerModel: 4 // Number of workers should be equal to number of cores
        },
        scaling: {
            enable: true, // Turn off before changing instance type and then turn back on
            minInstances: 1,
            maxInstances: 4,
            scaleTargetInvocations: 25,
            scaleInCooldown: 600,
            scaleOutCooldown: 30
        },
        network: {
            isolate: false
        },
        env: {

        },
        data: {
            // To ensure unique bucket for each endpoint across accounts
            deploymentBucket: `${endpointName}-deployment-bucket-${environment}`
        }
    },
    production: {
        resources: {
            initialInstanceCount: 2
        },
        scaling: {
            minInstances: 2
        },
    },
    staging: {

    },
    validation: {

    }
};

type AccountConfig = typeof accountConfig.default;
type WebHookConfig = typeof webHookConfig.default;
type ModelConfig = typeof modelConfig.default;

export const config = {
    environment,
    region,
    account: pickConfig<AccountConfig>(accountConfig.default, accountConfig[environment]),
    model: pickConfig<ModelConfig>(modelConfig.default, modelConfig[environment]),
    webHooks: pickConfig<WebHookConfig>(webHookConfig.default, webHookConfig[environment])
};