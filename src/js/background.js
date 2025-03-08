const CLIENT_ID = ""; // Replace with your MAL API key (can be obtained from https://myanimelist.net/apiconfig, for more info go to https://myanimelist.net/forum/?topicid=1973141)

function getSearchType() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("searchType", (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data.searchType || "anime"); // Default to "anime" if not set
            }
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchMAL") {
        const title = request.title;
        console.log("Background received request for title:", title);

        getSearchType().then(searchType => {
            console.log("Search type preference:", searchType);

            const animeUrl = `https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(title)}&limit=1&fields=id,title,main_picture,synopsis,mean,media_type`;
            const mangaUrl = `https://api.myanimelist.net/v2/manga?q=${encodeURIComponent(title)}&limit=1&fields=id,title,main_picture,synopsis,mean`;

            const fetchAnime = () => {
                return fetch(animeUrl, { headers: { "X-MAL-CLIENT-ID": CLIENT_ID } })
                    .then(response => response.ok ? response.json() : Promise.reject("Anime not found"))
                    .then(data => {
                        if (data.data?.length > 0) {
                            const anime = data.data[0];

                            if (anime.node.media_type === "music") {
                                return Promise.reject("anime skipped.");
                            }

                            console.log("MAL API Response Data (Anime):", anime);
                            sendResponse({ data: anime, isAnime: true , searchType: searchType});
                        } else {
                            return Promise.reject("No anime found.");
                        }
                    });
            };

            const fetchManga = () => {
                return fetch(mangaUrl, { headers: { "X-MAL-CLIENT-ID": CLIENT_ID } })
                    .then(response => response.ok ? response.json() : Promise.reject("Manga not found"))
                    .then(mangaData => {
                        if (mangaData?.data?.length > 0) {
                            console.log("MAL API Response Data (Manga):", mangaData);
                            sendResponse({ data: mangaData.data[0], isAnime: false, isManga: true });
                        } else {
                            return Promise.reject("No manga found.");
                        }
                    });
            };

            console.log(`Fetching ${searchType} for title: "${title}"`);
            if (searchType === "anime") {
                fetchAnime()
                    .catch(() => fetchManga()
                        .catch(() => sendResponse({ error: "No anime or manga found." })));
            } else {
                fetchManga()
                    .catch(() => fetchAnime()
                        .catch(() => sendResponse({ error: "No anime or manga found." })));
            }

        }).catch(error => {
            console.error("Error getting search type:", error);
            sendResponse({ error: error.message });
        });

        return true; 
    }
});
