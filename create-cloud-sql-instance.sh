#!/bin/bash

while getopts ":p:" opt; do
  case $opt in
    p)
      password=${OPTARG}
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

gcloud services enable compute.googleapis.com \
& gcloud sql instances create hololounge \
--database-version=MYSQL_8_0 \
--tier=db-f1-micro \
--region=asia-northeast1 \

& gcloud sql users set-password root \
--host=% \
--instance hololounge \
--password $password

$SHELL