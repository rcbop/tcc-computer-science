#!/bin/bash
S3_REGION='us-east-2'
S3_BUCKET='exemplo-docker-cicd'
AWSCLI_PROFILE='roger2'
S3_ACL='public-read'
CDN_DISTRIBUTION_ID='E2U22FZ5L89H9D'

aws s3 sync public/. s3://$S3_BUCKET/ --region $S3_REGION --acl $S3_ACL --profile $AWSCLI_PROFILE
aws cloudfront create-invalidation --distribution-id $CDN_DISTRIBUTION_ID --paths "/*"