const CLIENT_ID = ""; // Replace with your MAL API key

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchMAL") {
        const title = request.title;
        console.log("Background received request for title:", title);

        const animeUrl = `https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(title)}&limit=1&fields=id,title,main_picture,synopsis,mean,media_type`;
        const mangaUrl = `https://api.myanimelist.net/v2/manga?q=${encodeURIComponent(title)}&limit=1&fields=id,title,main_picture,synopsis,mean`;

        fetch(animeUrl, { headers: { "X-MAL-CLIENT-ID": CLIENT_ID } })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`MAL API Error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.data?.length > 0) {
                    const anime = data.data[0];

                    if (anime.node.media_type === "music") {
                        return fetch(mangaUrl, { headers: { "X-MAL-CLIENT-ID": CLIENT_ID } });
                    }

                    console.log("MAL API Response Data (Anime):", anime);
                    sendResponse({ data: anime, isAnime: true });
                } else {
                    console.log(`No anime found for "${title}", searching manga...`);
                    return fetch(mangaUrl, { headers: { "X-MAL-CLIENT-ID": CLIENT_ID } });
                }
            })
            .then(response => response ? response.json() : null)
            .then(mangaData => {
                if (mangaData?.data?.length > 0) {
                    console.log("MAL API Response Data (Manga):", mangaData);
                    sendResponse({ data: mangaData.data[0], isAnime: false});
                } else {
                    console.log(`No manga found for "${title}" either.`);
                    sendResponse({ error: "No anime or manga found." });
                }
            })
            .catch(error => {
                console.error("Fetch Error in background.js:", error);
                sendResponse({ error: error.message });
            });

        return true; 
    }
});
