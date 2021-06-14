import boto3
import json
import os
import io
from urllib.parse import urlparse
from pydash import py_ as _

s3 = boto3.resource('s3')
DATA_URI = urlparse(os.getenv('DATA_URI', 's3://mlops-2021/labeling/data'), allow_fragments=False)
LABELING_JOB_URI = urlparse(os.getenv('LABELING_JOB_URI', 's3://mlops-2021/labeling/output'), allow_fragments=False)

# Downloads the annotations from S3 given a job name
def get_labeled_outputs(labeling_job_name):
    obj = s3.Object(LABELING_JOB_URI.netloc, f'{LABELING_JOB_URI.path[1:]}/{labeling_job_name}/manifests/output/output.manifest')
    with io.BytesIO() as data:
        obj.download_fileobj(data)
        json_lines = data.getvalue().decode('utf-8').strip().split('\n')
        
    return [json.loads(line) for line in json_lines]

# Maps the BBOX annotations to the desired format
def map_labeled_bbox_data(labeled_data, label_key, reject_label='reject'):
    image_size = _.get(labeled_data, '{}.image_size.0'.format(label_key))
    class_map = _.get(labeled_data, '{}-metadata.class-map'.format(label_key))
    job_name = _.get(labeled_data, '{}-metadata.job-name'.format(label_key))
    creation_date = _.get(labeled_data, '{}-metadata.creation-date'.format(label_key))


    annotations_all = (_.chain(labeled_data)
                   .get('{}.annotations'.format(label_key))
                   .group_by('class_id')
                   .map_keys(lambda value, key: class_map[str(key)])
                   .value()
                  )
    
    is_reject = _.has(annotations_all, reject_label)
    bboxes = (_.chain(annotations_all)
                   .omit([reject_label])
                   .map_values(lambda values: _.map(values, lambda value: {
                       'x': value['left'],
                       'y': value['top'],
                       'width': value['width'],
                       'height': value['height']
                   }))
                  .value()
                  )
    
    field_name = _.chain(bboxes).keys().head().value()
 
    return _.assign({}, bboxes, {
        'id': _.get(labeled_data, 'id'), 
        'fieldName': field_name,
        'imageSize': image_size,
        'isRejected': is_reject,
        'jobName': job_name,
        'creationDate': creation_date
    })

# Saves the annotations to the data S3
def save_bbox_label_s3(label):
    obj = s3.Object(DATA_URI.netloc, f'{DATA_URI.path[1:]}/{label["id"]}/{label["fieldName"]}.bbox.json')
    body = json.dumps(label, indent=2).encode('utf-8')
    obj.put(Body=body)

# The conversion function
def convert_output_labels(labeling_job_name, field_name):
    labeled_outputs = get_labeled_outputs(labeling_job_name)
    for labeled_output in labeled_outputs:
        label = map_labeled_bbox_data(labeled_output, labeling_job_name)
        save_bbox_label_s3(label)
        
    return len(labeled_outputs)

def handler(event, context):
    labeling_job_name = event['labelingJobName']
    field_name = event['fieldName']
    
    if not labeling_job_name or not field_name:
        raise Exception("Missing arguments")
        
    print(labeling_job_name, field_name, LABELING_JOB_URI)
    
    count = convert_output_labels(labeling_job_name, field_name)
    
    return {
        'statusCode': 200,
        'count': count
    }