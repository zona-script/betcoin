#!/usr/bin/env bash

logfile=/var/log/support-node.log

if [[ -z "$(env | grep MONGO)" ]]
then
    echo "NO MONGO ENVIRONMENT VARIABLES" >> $logfile
    sleep 3
    exit 1
fi

cd /support-node && exec /sbin/setuser app /usr/bin/node app >> $logfile 2>&1
