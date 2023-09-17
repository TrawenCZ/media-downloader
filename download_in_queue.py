import subprocess
from sys import argv
import os

queue_file_path = os.environ["QUEUE_FILE_PATH"] if os.environ["NODE_ENV"] != "dev" else os.environ["QUEUE_FILE_PATH_TEST"]

def add_to_queue(link, alias_name):
    if len(link) == 0:
        exit(-1)
    
    if subprocess.run(f'wget -q --spider "{link}"', shell=True).returncode != 0:
        exit(-1)

    link_file = open(queue_file_path, "a")
    link_file.write(link + '"' + alias_name + '\n')
    exit(0)


if __name__ == '__main__':
    add_to_queue(argv[1], argv[2])
