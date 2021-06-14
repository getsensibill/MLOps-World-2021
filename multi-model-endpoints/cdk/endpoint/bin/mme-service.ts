#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServiceStack } from '../lib/service/service-stack';
import { config } from '../lib/config';

const app = new cdk.App();
const env = {
    account: config.account.id,
    region: config.region
};

new ServiceStack(app, `service-stack-${config.model.endpointName}`, {env});