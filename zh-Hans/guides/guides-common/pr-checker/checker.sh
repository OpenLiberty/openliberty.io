#!/bin/sh
set -o pipefail

repo=$1
pr_number=$2

SCRIPTPATH="$(
    cd "$(dirname "$0")" >/dev/null 2>&1
    pwd -P
)"
URL="https://api.github.com/repos/$repo/pulls/$pr_number/files"
UPDATED_FILES="$(curl -s -X GET -G $URL | jq -r '[ .[] | select(.status != "removed") | .filename ]' | tr -d '\n')"
ALL_FILES="$(curl -s -X GET -G $URL | jq -r '[ .[] |  .filename ]' | tr -d '\n')"

echo "$UPDATED_FILES"
if [ $(echo $ALL_FILES | jq 'length') = 1 ] && [ $(echo $ALL_FILES | jq '.[0]' | tr -d '"') = "README.adoc" ]; then
    echo "Test can be skipped because only README.adoc was updated"
    echo "::set-output name=canSkip::true"
elif [ $(echo $ALL_FILES | jq 'length') = 1 ] && [ $(echo $ALL_FILES | jq '.[0]' | tr -d '"') = "CONTRIBUTING.md" ]; then
    echo "Test can be skipped because only CONTRIBUTING.md was updated"
    echo "::set-output name=canSkip::true"
else
    echo "Need to run test"
    echo "::set-output name=canSkip::false"
fi

python3 "$SCRIPTPATH"/checker.py --deny "$SCRIPTPATH"/deny_list.json --warn "$SCRIPTPATH"/warning_list.json --tags "$SCRIPTPATH"/../guide_tags.json --repo "$repo" --rules "$SCRIPTPATH"/rules.json $(echo $UPDATED_FILES | jq '.[]' | tr -d '"')
