export ENDPOINT_NAME="mlops-mme-v1"

node_modules/aws-cdk/bin/cdk --app "npx ts-node bin/mme-service.ts" "$@"