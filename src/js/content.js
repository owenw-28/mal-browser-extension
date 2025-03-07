let lastRequestTime = 0; 
let selectionTimeout = null;
let tooltipImage = null;
let tooltipText = null;

// this ugly method was used as I couldn't properly format the image and writing the way I wanted with one tooltip
function createTooltips() {   
    tooltipImage = document.createElement("div");
    tooltipImage.id = "mal-tooltip-image";
    tooltipImage.style.position = "absolute";
    tooltipImage.style.background = "#222";
    tooltipImage.style.color = "#fff";
    tooltipImage.style.padding = "10px";
    tooltipImage.style.borderRadius = "5px";
    tooltipImage.style.fontSize = "14px";
    tooltipImage.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
    tooltipImage.style.display = "none";
    tooltipImage.style.height = "141px";
    tooltipImage.style.zIndex = "1000";
    tooltipImage.style.cursor = "pointer";
    tooltipImage.style.whiteSpace = "normal";
    document.body.appendChild(tooltipImage);

    tooltipText = document.createElement("div");
    tooltipText.id = "mal-tooltip-text";
    tooltipText.style.position = "absolute";
    tooltipText.style.background = "#222";
    tooltipText.style.color = "#fff";
    tooltipText.style.padding = "10px";
    tooltipText.style.borderRadius = "5px";
    tooltipText.style.fontSize = "14px";
    tooltipText.style.width = "300px"; 
    tooltipText.style.height = "141px"; 
    tooltipText.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
    tooltipText.style.display = "none";
    tooltipText.style.zIndex = "1000";
    tooltipText.style.whiteSpace = "normal";
    tooltipText.style.cursor = "pointer";
    tooltipText.style.overflow = "hidden"; 
    tooltipText.style.textOverflow = "ellipsis"; 
    document.body.appendChild(tooltipText);
}

function showTooltips(response, selection) {
    if (!tooltipImage || !tooltipText) createTooltips();

    anime = response.data.node;

    console.log("Showing tooltips for anime:", anime);

    const imageUrl = anime.main_picture ? anime.main_picture.large : "";

    let malUrl = `https://myanimelist.net/anime/${anime.id}`;


    if (!response.isAnime) {
        malUrl = `https://myanimelist.net/manga/${anime.id}`;
    }

    tooltipImage.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" width="100">` : ""}
    `;
    tooltipText.innerHTML = `
        <div>
            <strong>${anime.title}</strong><br>
            ⭐ ${anime.mean || "N/A"}<br>
            ${anime.synopsis ? anime.synopsis.slice(0, 200) + "..." : "No synopsis available"}
        </div>
    `;
    tooltipImage.style.display = "block";
    tooltipText.style.display = "block";

    tooltipImage.onclick = () => {
        window.open(malUrl, "_blank");
    };
    tooltipText.onclick = () => {
        window.open(malUrl, "_blank");
    };

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    tooltipImage.style.left = `${rect.left + window.scrollX}px`;
    tooltipImage.style.top = `${rect.top + window.scrollY - tooltipImage.offsetHeight}px`;
    tooltipText.style.left = `${rect.left + window.scrollX + tooltipImage.offsetWidth}px`; 
    tooltipText.style.top = `${rect.top + window.scrollY - tooltipText.offsetHeight}px`;
}

function fetchMALData(title, selection) {
    console.log("Sending request to background for:", title);

    chrome.runtime.sendMessage({ action: "fetchMAL", title }, (response) => {   // Response either anime or manga
        console.log("Received response from background.js:", response);

        if (!response || response.error) {
            console.error("MAL API Error:", response ? response.error : "No response received");
        } else {
            const anime = response.data.node;   // This block of code used to help debug
            console.log(`Anime Data Received:`);   
            console.log(`Title: ${anime.title}`);
            console.log(`Rating: ${anime.mean}`); 
            console.log(`Synopsis: ${anime.synopsis}`); 
            console.log(`Image URL: ${anime.main_picture.large}`); 
        
            showTooltips(response, selection);
        }
    });
}

document.addEventListener("selectionchange", () => {
    if (selectionTimeout) {
        clearTimeout(selectionTimeout);
    }

    selectionTimeout = setTimeout(async () => {
        const selection = window.getSelection();
        if (!selection || !selection.toString().trim()) {
            if (tooltipImage) {
                tooltipImage.remove();
                tooltipImage = null;
            }
            if (tooltipText) {
                tooltipText.remove();
                tooltipText = null;
            }
            return;
        }

        let text = selection.toString().trim();
        const now = Date.now();

        if (text.split(/\s+/).length < 9) {   // Don't process if highlighted text too long
            if (now - lastRequestTime >= 1000) { // Rate limiter (1 API request per second)
                lastRequestTime = now;
                console.log(`Checking title: ${text}`);
                fetchMALData(text, selection);
            }
        } else {
            console.log("Highlighted text is too long, skipping fetch.");
        }
    }, 1000); // Wait 1 second before processing highlighted text
});
