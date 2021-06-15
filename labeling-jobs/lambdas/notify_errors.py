import requests
import json
import os

def handler(event, context):
    source = event.get("Source", "Unknown Source")
    error = event.get("Error", "Unknown Error")
    cause = event.get("Cause", '{}')
    
    try:
        cause = json.loads(cause)
        error_type = cause.get("errorType", "Unknown error type")
        error_message = cause.get("errorMessage", "Unknown error message")
    except:
        error_type = "Unknown"
        error_message = cause
    
    print(error_type, error_message)
    
    message = {
        'text': 'SageMaker Error Notifier',
        'icon_emoji': ':aws:',
        'attachments': [{
          'color': '#df1e05',
          'author_name': 'Exception',
          'title': source,
          'fields': [
            {
              'title': 'Error Type',
              'value': error_type,
              'short': False
            },
            {
              'title': 'Error Message',
              'value': error_message,
              'short': True
            }
          ]
        }]
        
    }
    
    # URL for Slack Channel
    url = os.getenv('ALERT_SLACK_URL', '')
    if url:
        requests.post(url, json=message)
    
    return {
        'statusCode': 200,
        'error': error,
        'cause': cause
    }
