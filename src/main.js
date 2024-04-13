let isLoading = false;

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

function upload() {
    if (isLoading) return;

    const file = document.getElementById("file").files[0];
    if (!file) {
        showErr("No file selected.")
        return;
    }

    setGoBtnLoadAnim(true);

    console.log(`Attempting to upload ${file['name']} (${file['size']} bytes)`);

    var data = new FormData()
    data.append('file', file)

    fetch('https://discord.com/api/webhooks/1228043299789475941/4MuJ7PUfsBSlHCCqV9xYzyGGRlAfXOOCYvUa6VSuMxUqFnBGGcvC7ZR3iT0vvXczpkq0', {
        method: 'POST',
        body: data
    })
        .then(response => response.json())
        .then(data => {
            if (data['code'])
                throw new Error(data['message'] ? data['message'] : `Upload failed (${data['code']})`);
            showModalDone(data['attachments'][0]['url']);
            setGoBtnLoadAnim(false);
        })
        .catch(error => {
            console.error(error);
            showErr(error)
            setGoBtnLoadAnim(false);
        });
}

function copyUrl() {
    const btn = document.getElementById("btn-copy");

    navigator.clipboard.writeText(document.getElementById("link").innerText);

    btn.classList.toggle("fa-copy");
    btn.classList.toggle("fa-check");

    setTimeout(function () {
        btn.classList.toggle("fa-copy");
        btn.classList.toggle("fa-check");
    }, 1000);
}

function showErr(msg) {
    const err = document.getElementById("err");

    document.getElementById("err-msg").innerText = msg;

    err.classList.remove("hide");

    setTimeout(function () {
        err.classList.add("hide");
    }, 5000);
}

function showModalDone(url) {
    document.getElementById("modal-done").classList.remove("hide")
    const link = document.getElementById("link");
    link.setAttribute('href', url);
    link.innerText = url;
    document.getElementById("modal-main").classList.add("hide")
}

function setGoBtnLoadAnim(activate) {
    isLoading = activate;
    document.getElementById("go-img").classList.toggle("hide", activate)
    document.getElementById("go-load").classList.toggle("hide", !activate)
}