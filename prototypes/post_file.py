import requests

WEBHOOK = "https://discord.com/api/webhooks/1228043299789475941/4MuJ7PUfsBSlHCCqV9xYzyGGRlAfXOOCYvUa6VSuMxUqFnBGGcvC7ZR3iT0vvXczpkq0"


def post_file(webhook_url, file_path):
    with open(file_path, 'rb') as f:
        file_content = f.read()

    response = requests.post(webhook_url, files={
        "file": file_content
    })

    if response.status_code == 200:
        print("File posted successfully!")
        print(response.json()['attachments'][0]['url'])
    else:
        print(f"Failed to post file. Status code: {response.status_code}")
        print(response.text)


def main() -> None:
    file_path = "resources/go-button.svg"
    post_file(WEBHOOK, file_path)


if __name__ == "__main__":
    main()
