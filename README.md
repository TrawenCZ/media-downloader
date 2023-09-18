# Media Downloader Build with TypeORM

Steps to run this project:

1. Run `npm i` command in this and client folder
2. Create ".env" file in root folder, it should contain variables shown below
3. Setup database settings inside `data-source.ts` file (optional)
4. Run `npm start` command


## .env file example content
FILE_OUTPUT_PATH ="/media/pi"
FILE_OUTPUT_PATH_TEST="./download_tests"
QUEUE_FILE_PATH="/tmp/links.txt"
QUEUE_FILE_PATH_TEST="./download_tests/links.txt"
LIMIT_SPEED_RATE=100k
NODE_ENV="development"