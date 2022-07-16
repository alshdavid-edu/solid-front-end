#!/bin/sh

aws s3 rm --recursive s3://davidalsh.com/blog
# aws s3 cp --recursive --content-encoding br --exclude ".github/**" ./ s3://davidalsh.com/blog
aws s3 cp --recursive ./.github/dist s3://davidalsh.com/blog
aws cloudfront create-invalidation --distribution-id E1RN9EP7R6042I --paths /blog/\*