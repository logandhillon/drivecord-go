document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

function upload() {
    const file = document.getElementById("file").files[0];
    if (!file) return;
    console.log(`Attempting to upload ${file['name']} (${file['size']} bytes)`);

    var data = new FormData()
    data.append('file', file)

    fetch('https://discord.com/api/webhooks/1228043299789475941/4MuJ7PUfsBSlHCCqV9xYzyGGRlAfXOOCYvUa6VSuMxUqFnBGGcvC7ZR3iT0vvXczpkq0', {
        method: 'POST',
        body: data
    })
        .then(response => {
            if (!response.ok)
                throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log(data['attachments'][0]['url']);
        })
        .catch(error => console.error(error));
}