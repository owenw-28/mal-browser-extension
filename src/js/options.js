document.addEventListener("DOMContentLoaded", function () {
    const checkbox = document.querySelector(".label .checkbox");

    chrome.storage.sync.get("searchType", (data) => {
        if (data.searchType === "manga") {
            document.body.classList.add("mangaBackground");
            checkbox.checked = true;
            console.log("Loaded search type preference: manga");
        } else {
            document.body.classList.remove("mangaBackground");
            checkbox.checked = false;
            console.log("Loaded search type preference: anime");
        }
    });

    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            document.body.classList.add("mangaBackground");
            chrome.storage.sync.set({ searchType: "manga" }, () => {
                console.log("Search type set to: manga");
            });
        } else {
            document.body.classList.remove("mangaBackground");
            chrome.storage.sync.set({ searchType: "anime" }, () => {
                console.log("Search type set to: anime");
            });
        }
    });
});
