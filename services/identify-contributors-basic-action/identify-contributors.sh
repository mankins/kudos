#!/bin/sh

echo "Kudos!"
cd $1

# simple example, extract from node js package.json
rm /tmp/kudos.txt

# try contributors
cat package.json | jq -r '.contributors[]' >> /tmp/kudos.txt

# try maintainers
cat package.json | jq -r '.maintainers[]' >> /tmp/kudos.txt

echo "Kudos to:"
echo "-start-"
cat /tmp/kudos.txt | sort | uniq
echo "-end-"

