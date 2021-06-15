# Multi-Model Endpoints with CDK
This directory contains the code needed to deploy a multi-model endpoint on SageMaker:
* A CDK project to deploy the endpoint along with a bucket to host the models, autoscaling and monitoring
* Notebooks to download and package sample Huggingface models for deployment to MME

Prerequisites
-------------

For the python notebooks install the dependencies using `requirements.txt`. You will also need to install `pyenv`. Install its [dependencies](https://github.com/pyenv/pyenv/wiki#suggested-build-environment) and then run `curl https://pyenv.run | bash`. After that install python `3.6.10` with the command `pyenv install 3.6.10`
