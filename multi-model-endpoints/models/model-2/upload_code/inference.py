from transformers import AutoTokenizer, AutoModelForSequenceClassification
from scipy.special import softmax

import json

from typing import Dict, Tuple

class InferenceContext:
    def __init__(self, model_dir: str):
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_dir)
        
    def predict(self, text: str) -> Dict:
        encoded_input = self.tokenizer(text, return_tensors='pt')
        output = self.model(**encoded_input)
        sentiments = softmax(output[0][0].detach().numpy()).tolist()

        return {
            'negative': sentiments[0],
            'neutral': sentiments[1],
            'positive': sentiments[2]
        }
    
    
# !!IMPORTANT!!
# These following function signatures should never be changed
# else SageMaker will not be able to route requests into this model

JSON_CONTENT_TYPE = "application/json"

def model_fn(model_dir: str) -> InferenceContext:
    """
    Called by SageMaker to load the model
    """
    return InferenceContext(model_dir)


def predict_fn(request: Dict, context: InferenceContext):
    """
    Called by SageMaker to process a request
    """
    text = request.get("text", "")
    return context.predict(text)


def input_fn(serialized_input_data: str, content_type: str = JSON_CONTENT_TYPE) -> Dict:
    """
    Called by SageMaker to deserialize the JSON request into a dictionary
    """
    if content_type == JSON_CONTENT_TYPE:
        input_data = json.loads(serialized_input_data)
        return input_data
    else:
        return {}


def output_fn(response: Dict, accept: str = JSON_CONTENT_TYPE) -> Tuple[str, str]:
    """
    Called by SageMaker to serialize the response into JSON
    """
    if accept == JSON_CONTENT_TYPE:
        return json.dumps(response), accept
    raise ValueError("Requested unsupported ContentType in Accept: " + accept)
