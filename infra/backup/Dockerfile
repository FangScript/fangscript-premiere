FROM postgres:17-alpine
RUN apk add --no-cache aws-cli
COPY run.sh /backup.sh
ENTRYPOINT ["sh","/backup.sh"]
