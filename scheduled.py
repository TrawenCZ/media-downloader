from sys import argv
import subprocess
from time import sleep
import os


def exec_scheduled_download():
    if not os.path.exists("/tmp/links.txt"):
        return
    file = open("/tmp/links.txt", "r")
    for item in os.scandir('/media/pi'):
        if item.is_dir():
            for link in file.readlines():
                file_name = link.split('/')[-1]
                log_file_name = os.getcwd() + "/src/storage/progressLogs/" + file_name + '.log'

                # check if file_name has suffix
                if len(file_name.split(".")) == 1 or len(file_name.split(".")[-1]) > 4:
                    file_name += '.mkv'
                subprocess.Popen(f'wget -o "{log_file_name}" -O "{file_name}" "{link}"', shell=True, cwd=item.path)
            break
    sleep(5)
    file.close()
    os.remove("/tmp/links.txt")


if __name__ == '__main__':
    exec_scheduled_download()
