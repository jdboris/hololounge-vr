while getopts p: flag
do
    case "${flag}" in
        p) password=${OPTARG};;
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