# Container image that runs your code
FROM alpine:latest
LABEL CREATOR Matt Mankins <mankins@gmail.com>
LABEL MAINTAINER Matt Mankins <mankins@gmail.com>

RUN apk add --no-cache jq

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY identify-contributors.sh /identify-contributors.sh

# Code file to execute when the docker container starts up
ENTRYPOINT ["/identify-contributors.sh"]
