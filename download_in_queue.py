from sys import argv


def add_to_queue(link):
    if len(link) == 0:
        exit(-1)
    
    link_file = open("/tmp/links.txt", "a")
    link_file.write(link + '\n')
    exit(0)


if __name__ == '__main__':
    add_to_queue(argv[1])
