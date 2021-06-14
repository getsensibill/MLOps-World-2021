/* eslint no-process-env: off */

'use strict';

const https = require('https');

exports.handler = (event, context, callback) => {
  
    console.log(`REQUEST RECEIVED:\n${JSON.stringify(event)}`);

    if (process.env.WEBHOOK_HOSTNAME == null || process.env.WEBHOOK_PATH == null) {
        return;
    }

    const payload = createPayload(event);
    
    const options = {
        hostname: process.env.WEBHOOK_HOSTNAME,
        method: 'POST',
        path: process.env.WEBHOOK_PATH,
    };
  
    const req = https.request(options, (res) => res.on('data', () => callback(null, 'OK')));
    req.on('error', (error) => callback(JSON.stringify(error)));
    req.write(payload);
    req.end();
};

function createPayload(event) {
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);
    const timestamp = event.Records[0].Sns.Timestamp;
    const regionCode = 'us-east-1'
    const alarmName = snsMessage.AlarmName;
    const alarmDescription = snsMessage.AlarmDescription;
    const url = `https://${regionCode}.console.aws.amazon.com/cloudwatch/home?region=${regionCode}#alarmsV2:alarm/${alarmName}`
    const color = snsMessage.NewStateValue == 'ALARM' ? '#fd9833' : '#71fc81';
    const text = alarmDescription + (snsMessage.NewStateValue == 'ALARM' ? ' Above Threshold' : ' Back to normal');

    const message = {
        attachments: [
            {
                mrkdwn_in: ['text'],
                color,
                author_name: text,
                title: 'Logs',
                title_link: url,
                fields: [
                    {
                        title: 'Source',
                        value: alarmName,
                        short: false
                    },
                    {
                        title: 'Timestamp',
                        value: timestamp,
                        short: true
                    }
                ]
            }
        ]
    };

    return JSON.stringify(message);
}