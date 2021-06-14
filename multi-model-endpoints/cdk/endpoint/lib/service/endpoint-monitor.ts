import cdk = require('@aws-cdk/core');
import cloudwatch = require('@aws-cdk/aws-cloudwatch');
import actions = require('@aws-cdk/aws-cloudwatch-actions');
import sns = require('@aws-cdk/aws-sns');
import { config } from '../config';
import { createMonitoringLambda, MetricName } from '../utils/lambda-utils';

interface EndpointMonitorProps {

}

export class EndpointMonitor extends cdk.Construct{
    public readonly alarm5XX: cloudwatch.Alarm;
    public readonly alarm4XX: cloudwatch.Alarm;

    constructor(scope: cdk.Construct, id: string, props?: EndpointMonitorProps) {
        super(scope, id);

        this.alarm4XX = this.createAlarm('Invocation4XXErrors', '4XX Errors');
        this.alarm5XX = this.createAlarm('Invocation5XXErrors', '5XX Errors');
    }

    private createAlarm(metricName: MetricName, alarmDescription: string) {
        const metric = new cloudwatch.Metric({
            namespace: 'AWS/SageMaker',
            metricName,
            dimensions: {
                EndpointName: config.model.endpointName,
                VariantName: 'AllTraffic'
            }
        });

        const alarm = metric.createAlarm(this, `Alarm${metricName}`, {
            alarmName: `${config.model.endpointName}-${config.environment}-${metricName}`,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            threshold: 1,
            evaluationPeriods: 1,
            alarmDescription,
            treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
        });

        const lambdaFn = createMonitoringLambda(this, `Lambda${metricName}`, metricName);

        const topic = new sns.Topic(this, `Topic${metricName}`);
        new sns.Subscription(this, `Subscription${metricName}`, {
            endpoint: lambdaFn.functionArn,
            protocol: sns.SubscriptionProtocol.LAMBDA,
            topic
        });
        const snsAction = new actions.SnsAction(topic);

        alarm.addAlarmAction(snsAction);
        alarm.addOkAction(snsAction);

        return alarm;
    }
}