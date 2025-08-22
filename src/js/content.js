let lastRequestTime = 0; 
let selectionTimeout = null;
let tooltipImage = null;
let tooltipText = null;

function createTooltips() {
    tooltipImage = document.createElement("div");
    tooltipImage.id = "mal-tooltip";
    tooltipImage.style.position = "absolute";
    tooltipImage.style.background = "#2e51a2";
    tooltipImage.style.color = "#fff";
    tooltipImage.style.padding = "10px";
    tooltipImage.style.borderRadius = "5px";
    tooltipImage.style.fontSize = "14px";
    tooltipImage.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
    tooltipImage.style.display = "none";
    tooltipImage.style.width = "400px";
    tooltipImage.style.height = "141px";
    tooltipImage.style.zIndex = "1000";
    tooltipImage.style.cursor = "pointer";
    tooltipImage.style.whiteSpace = "normal";
    tooltipImage.style.overflow = "hidden";
    tooltipImage.style.textOverflow = "ellipsis";
    tooltipImage.style.display = "none";
    document.body.appendChild(tooltipImage);
    tooltipText = tooltipImage; 
}

function showTooltips(response, selection) {
    if (!tooltipImage || !tooltipText) createTooltips();

    const anime = response.data.node;
    console.log("Showing tooltips for anime:", anime);
    const imageUrl = anime.main_picture ? anime.main_picture.large : "";
    let malUrl = `https://myanimelist.net/anime/${anime.id}`;
    if (!response.isAnime) {
        malUrl = `https://myanimelist.net/manga/${anime.id}`;
    }

        const tooltipHeight = 140; 
        const imageHeight = 135;   
        const imageWidth = 100;     
        tooltipImage.innerHTML = `
            <div style="display: flex; align-items: center; height: ${tooltipHeight}px;">
                ${imageUrl ? `<img src='${imageUrl}' style='height: ${imageHeight}px; width: ${imageWidth}px; object-fit: cover; border-radius: 4px; margin-right: 16px;'>` : ""}
                <div style='flex: 1; overflow: hidden; padding-top:32px;'>
                    <strong>${anime.title}</strong><br>
                    ⭐ ${anime.mean || "N/A"}<br>
                    <div style='max-height: ${imageHeight}px; overflow-y: auto; padding-right: 8px; padding-bottom: 4px;'>${anime.synopsis ? anime.synopsis : "No synopsis available"}</div>
                </div>
            </div>
        `;
    tooltipImage.style.display = "block";

    tooltipImage.onclick = () => {
        window.open(malUrl, "_blank");
    };

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    tooltipImage.style.left = `${rect.left + window.scrollX}px`;
    tooltipImage.style.top = `${rect.top + window.scrollY - tooltipImage.offsetHeight}px`;
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
