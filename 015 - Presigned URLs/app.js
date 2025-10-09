// === API URLs ===
const API_BASE = "https://l020rsit4d.execute-api.us-east-2.amazonaws.com/013";
const UPLOAD_URL_API = `${API_BASE}/generate-upload-url`;
const LIST_FILES_API = `${API_BASE}/list-files`;
const DOWNLOAD_URL_API = `${API_BASE}/generate-download-url`;

// === DOM Elements ===
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const filenameInput = document.getElementById("filenameInput");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const dropZone = document.getElementById("dropZone");
const dropText = document.getElementById("dropText");
const fileDetails = document.getElementById("fileDetails");
const selectedFilename = document.getElementById("selectedFilename");
const logSection = document.getElementById("logSection");
const filesSection = document.getElementById("filesSection");
const fileListEl = document.getElementById("fileList");

// === Utility: log messages ===
function log(msg, isError = false) {
    const p = document.createElement("div");
    p.textContent = msg;
    if (isError) p.classList.add("error");
    logEl.prepend(p);
    logSection.style.display = "block";
}

// === Get pre-signed upload URL ===
async function getPresignedUrl(filename) {
    const res = await fetch(UPLOAD_URL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_name: filename })
    });
    if (!res.ok) throw new Error(`Failed to get upload URL: ${res.statusText}`);
    return res.json(); // { upload_url, file_key }
}

// === Upload file with progress ===
function uploadWithProgress(url, file, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);

        xhr.upload.onprogress = e => {
            if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
        };

        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve(xhr) : reject(new Error(`Upload failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.onabort = () => reject(new Error("Upload aborted"));

        xhr.send(file);
    });
}

// === Handle file upload ===
async function handleUpload() {
    const file = fileInput.files[0];
    if (!file) return alert("Select a file first.");

    const suggestedName = filenameInput.value?.trim() || file.name;
    statusEl.textContent = "Requesting upload URL...";
    log(`Requesting pre-signed URL for: ${suggestedName}`);

    try {
        const { upload_url, file_key } = await getPresignedUrl(suggestedName);
        log(`Got upload URL — file will be saved as: ${file_key}`);
        statusEl.textContent = "Uploading...";
        progressWrap.style.display = "block";
        progressBar.style.width = "0%";
        progressText.textContent = "0%";

        await uploadWithProgress(upload_url, file, pct => {
            const p = Math.round(pct);
            progressBar.style.width = `${p}%`;
            progressText.textContent = `${p}%`;
        });

        progressBar.style.width = "100%";
        progressText.textContent = "100%";
        statusEl.textContent = "✅ Upload successful";
        log(`Upload complete — S3 key: ${file_key}`);

        const keyLine = document.createElement("div");
        keyLine.innerHTML = `S3 Object Key: <code>${file_key}</code>`;
        logEl.prepend(keyLine);

        fileInput.value = "";
        filenameInput.value = "";
        selectedFilename.textContent = "";
        fileDetails.style.display = "none";

        await fetchFileList(); // Refresh file list
    } catch (err) {
        console.error(err);
        statusEl.textContent = "❌ Upload failed";
        log(`Error: ${err.message}`, true);
    }
}

// === Handle file selection ===
function handleFileSelect(files) {
    if (files && files.length) {
        fileInput.files = files;
        selectedFilename.textContent = files[0].name;
        fileDetails.style.display = "block";
    }
}

// === Fetch uploaded files from S3 ===
async function fetchFileList() {
    try {
        const res = await fetch(LIST_FILES_API);
        if (!res.ok) throw new Error(`Failed to fetch file list: ${res.statusText}`);
        const { files } = await res.json(); // expecting { files: ["file1.txt", "file2.jpg"] }
        renderFileList(files);
    } catch (err) {
        console.error(err);
        log(`Error fetching files: ${err.message}`, true);
    }
}

// === Render file list with download buttons ===
function renderFileList(files) {
    fileListEl.innerHTML = "";
    if (!files || !files.length) {
        fileListEl.innerHTML = `<p class="placeholder">No files uploaded yet...</p>`;
        filesSection.style.display = "none";
        return;
    }

    filesSection.style.display = "block";

    files.forEach(filename => {
        const item = document.createElement("div");
        item.className = "file-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "file-name";
        nameSpan.textContent = filename;

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "download-btn";
        downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download`;
        downloadBtn.addEventListener("click", () => downloadFile(filename));

        item.appendChild(nameSpan);
        item.appendChild(downloadBtn);
        fileListEl.appendChild(item);
    });
}

// === Generate pre-signed download URL and download file ===
async function downloadFile(filename) {
    try {
        const res = await fetch(DOWNLOAD_URL_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file_name: filename })
        });
        if (!res.ok) throw new Error(`Failed to get download URL: ${res.statusText}`);
        const { download_url } = await res.json();
        window.open(download_url, "_blank");
        log(`Started download: ${filename}`);
    } catch (err) {
        console.error(err);
        log(`Error downloading ${filename}: ${err.message}`, true);
    }
}

// === Event listeners ===
uploadBtn.addEventListener("click", handleUpload);

["dragenter", "dragover"].forEach(evt => {
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add("dragover");
    });
});

["dragleave", "dragend", "drop"].forEach(evt => {
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove("dragover");
    });
});

dropZone.addEventListener("drop", e => handleFileSelect(e.dataTransfer.files));
dropZone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", e => handleFileSelect(e.target.files));

// === Initialize file list on page load ===
fetchFileList();
