export ENDPOINT_NAME="mlops-mme-torchserve"
export FRAMEWORK_VERSION="1.7.1-cpu-py36-ubuntu18.04"
node_modules/aws-cdk/bin/cdk --app "npx ts-node bin/mme-service.ts" "$@"