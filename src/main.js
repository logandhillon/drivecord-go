let isLoading = false;
const UPLOAD_LIMIT = 25 * 1024 * 1024; // 25 MB

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

function formatBytes(bytes) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    
    while (bytes >= 1024 && unitIndex < units.length - 1) {
        bytes /= 1024;
        unitIndex++;
    }
    
    return bytes.toFixed(2) + ' ' + units[unitIndex];
}

function chunkFile(file) {
    return new Promise((resolve, reject) => {
        const fileSize = file.size;
        const chunks = Math.ceil(fileSize / UPLOAD_LIMIT);
        const chunkPromises = [];

        let offset = 0;

        for (let i = 0; i < chunks; i++) {
            const chunkPromise = new Promise((resolveChunk, rejectChunk) => {
                const reader = new FileReader();
                const chunkEnd = Math.min(offset + UPLOAD_LIMIT, fileSize);

                reader.onload = (event) => {
                    const chunk = event.target.result;
                    resolveChunk(chunk);
                };

                reader.onerror = (error) => {
                    rejectChunk(error);
                };

                const blob = file.slice(offset, chunkEnd);
                reader.readAsArrayBuffer(blob);

                offset += UPLOAD_LIMIT;
            });

            chunkPromises.push(chunkPromise);
        }

        Promise.all(chunkPromises)
            .then((chunks) => {
                resolve(chunks);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function uploadChunk(chunk) {

    var data = new FormData()
    data.append('file', chunk)

    return fetch('https://discord.com/api/webhooks/1228043299789475941/4MuJ7PUfsBSlHCCqV9xYzyGGRlAfXOOCYvUa6VSuMxUqFnBGGcvC7ZR3iT0vvXczpkq0', {
        method: 'POST',
        body: data
    })
        .then(res => res.json())
        .then(res => {
            if (res['retry_after']) {
                console.warn(`Rate-limited. Will retry after ${res['retry_after'] * 1000} ms`);
                setTimeout(function() {
                    uploadChunk(chunk);
                }, res['retry_after'] * 1000)
                return;
            }

            if (res['code'])
                throw new Error(res['message'] ? res['message'] : `Upload failed (${res['code']})`);

            // showModalDone(data['attachments'][0]['url']);
            console.log("Done!", res)
            setGoBtnLoadAnim(false);
        })
        .catch(error => {
            console.error(error);
            showErr(error)
            setGoBtnLoadAnim(false);
        });
}

function upload() {
    if (isLoading) return;

    const file = document.getElementById("file").files[0];
    if (!file) {
        showErr("No file selected.")
        return;
    }

    setGoBtnLoadAnim(true);

    console.log("Chunking file");

    chunkFile(file)
        .then(chunks => {
            console.log(`Created ${chunks.length} chunks`);
            console.log(`Initiating upload`);

            chunks.forEach((chunk, i) => {
                console.log(`Uploading chunk ${i+1}/${chunks.length}`);

                uploadChunk(chunk);
            });
        })
        .catch(error => {
            console.error("Something went wrong while chunking the file. " + error);
            showErr("Something went wrong while chunking the file. " + error);
            setGoBtnLoadAnim(false);
        });

    // var data = new FormData()
    // data.append('file', file)

    // fetch('https://discord.com/api/webhooks/1228043299789475941/4MuJ7PUfsBSlHCCqV9xYzyGGRlAfXOOCYvUa6VSuMxUqFnBGGcvC7ZR3iT0vvXczpkq0', {
    //     method: 'POST',
    //     body: data
    // })
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data['code'])
    //             throw new Error(data['message'] ? data['message'] : `Upload failed (${data['code']})`);
    //         showModalDone(data['attachments'][0]['url']);
    //         setGoBtnLoadAnim(false);
    //     })
    //     .catch(error => {
    //         console.error(error);
    //         showErr(error)
    //         setGoBtnLoadAnim(false);
    //     });
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

document.addEventListener("DOMContentLoaded", function() {
    const input = document.getElementById("file");

    try {
        document.getElementById("file-size").innerText = formatBytes(input.files[0]['size']);
    } catch {}

    input.addEventListener("change", function() {
        document.getElementById("file-size").innerText = formatBytes(input.files[0]['size']);
    })
})