from sys import argv
import subprocess
import os

default_outputdir = os.environ["FILE_OUTPUT_PATH"] if os.environ["DEV_ENV"] != "dev" else os.environ["FILE_OUTPUT_PATH_TEST"]
limit_rate = f"--limit-rate={os.environ['LIMIT_SPEED_RATE']}"


def exec_download(link, alias_name):
    if len(link) == 0:
        exit(-1)

    
    file_name = link.split('/')[-1]
    log_file_name = os.getcwd() + "/src/storage/progressLogs/" + file_name + '.log'

    output_dir_content = list(filter(lambda x : x.is_dir(), os.scandir(default_outputdir)))
    if len(output_dir_content) == 0:
        print("No output dir found in " + default_outputdir)
        exit(-1)

    output_device_path = output_dir_content[0].path

    if subprocess.run(f'wget -q --spider "{link}"', shell=True, cwd=output_device_path).returncode != 0:
        exit(-1)

    subprocess.Popen(f'wget {limit_rate} -o "{log_file_name}" -O "{alias_name + ".mkv"}" "{link}"', shell=True, cwd=output_device_path)
    exit(0)


if __name__ == '__main__':
    exec_download(argv[1], argv[2])
