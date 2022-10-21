#!/bin/sh

echo "Kudos!"
cd $1

# simple example, extract from node js package.json
rm /tmp/kudos.txt

echo "nodejs..."

# try contributors
find . -type f -name 'package.json' -prune | while read line; do cat "$line" | jq -r '.contributors[].email' | grep -v null >> /tmp/kudos.txt; done

# try maintainers
find . -type f -name 'package.json' -prune | while read line; do cat "$line" | jq -r '.maintainers[].email' | grep -v null >> /tmp/kudos.txt; done

echo "Contributors:"
echo "-start-"
cat /tmp/kudos.txt | sort | uniq
echo "-end-"

