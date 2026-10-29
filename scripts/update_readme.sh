#!/bin/sh

set -e

VERSION=$1
BRANCH=$2

if [ -z "${VERSION}" ]; then
  echo "Version not specified; Exiting."
  exit 1;
fi
if [ -z "${BRANCH}" ]; then
  echo "Version not specified; Exiting."
  exit 1;
fi

if [ ! "${BRANCH}" = "refs/heads/master" ]; then
  echo "Branch is ${BRANCH}; README.md not updated."
  exit 0;
fi

sed -i -e "s/NEXT_VERSION/v${VERSION}/g" ./README.md
sed -i -e "s|https://github.com/kalkih/mini-graph-card/releases/download/.*/mini-graph-card-bundle.js|https://github.com/kalkih/mini-graph-card/releases/download/v${VERSION}/mini-graph-card-bundle.js|g" ./README.md
sed -i -e "s|-\surl:\s/local/mini-graph-card-bundle.js?v=.*|- url: /local/mini-graph-card-bundle.js?v=${VERSION}|g" ./README.md

