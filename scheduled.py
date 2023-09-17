import requests
import os

port = int(os.environ["PORT"]) if os.getenv("PORT") is not None else 3000

def exec_scheduled_download():
    r = requests.post(f'http://localhost:{port}/api/downloads/queue-start')
    print(r.text)

if __name__ == '__main__':
    exec_scheduled_download()
