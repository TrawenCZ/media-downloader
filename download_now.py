from sys import argv
import subprocess
import os

default_outputdir = os.environ["OUTPUT_PATH"] if int(os.environ["TEST_ENV"]) == 1 else './download_tests'
limit_rate = f"--limit-rate={os.environ['LIMIT_SPEED_RATE']}"


def exec_download(link):
    if len(link) == 0:
        exit(-1)
    file_name = link.split('/')[-1]
    log_file_name = os.getcwd() + "/src/storage/progressLogs/" + file_name + '.log'

    # check if file_name has suffix
    if len(file_name.split(".")) == 1 or len(file_name.split(".")[-1]) > 4:
        file_name += '.mkv'

    for item in os.scandir("/media/pi"):
        if not item.is_dir():
            continue
        if subprocess.run(f'wget -q --spider "{link}"', shell=True, cwd=item.path).returncode != 0:
            exit(-1)
        subprocess.Popen(f'wget -o "{log_file_name}" -O "{file_name}" "{link}"', shell=True, cwd=item.path)
        exit(0)


if __name__ == '__main__':
    exec_download(argv[1])
