document.addEventListener("DOMContentLoaded", function () {
    const radioButtons = document.querySelectorAll('input[name="searchType"]');

    // Load saved preference
    chrome.storage.sync.get("searchType", (data) => {
        if (data.searchType) {
            document.querySelector(`input[value="${data.searchType}"]`).checked = true;
            console.log("Loaded search type preference:", data.searchType);
        } else {
            console.log("No search type preference found, defaulting to 'anime'.");
        }
    });

    // Save new selection
    radioButtons.forEach((radio) => {
        radio.addEventListener("change", function () {
            chrome.storage.sync.set({ searchType: this.value }, () => {
                console.log("Search type set to:", this.value);
            });
        });
    });
});