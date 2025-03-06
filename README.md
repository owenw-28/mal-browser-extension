# MyAnimelist Search Browser Extension

This is my first experience building a browser extension and working with JavaScript. The main goal was to help me learn JavaScript fundamentals and Chrome extension development.

#### How It Works

1. Highlight an anime or manga title on any webpage.
2. If a match is found, it retrieves the synopsis, rating and image from MAL and displays them on a tooltip.
3. Clicking the tooltip redirects to the MAL page for that anime.
4. A toggle switch can be found in the options (Details -> Extension options) to make the extension prioritise searching for either the anime or the manga.

#### In Action

![](mal_demo.gif)

Images Used (Thank you to the respective makers):

Anime: https://wallpapers.com/wallpapers/anime-collage-1920-x-1080-wallpaper-yv844c9tz9diiip2.html

Manga: https://www.reddit.com/r/wallpaper/comments/18zaoe1/updated_manga_page_background_8k_7680x4320/?rdt=54699

#### Installation

1. Clone this repository.
2. Open Chrome and go to chrome://extensions/
3. Enable Developer Mode
4. Click Load Unpacked and select the extension folder

#### API & Dependencies

Requires a MAL API key (which can be obtained from https://myanimelist.net/apiconfig, for more info start with https://myanimelist.net/forum/?topicid=1973141)

#### Limitations

- Will return the closest corresponding anime/manga title for any input (less than 9 words), so highlighting random words may yield a result
- Sometimes will return an anime you won't expect (another anime in the same series or the completely wrong anime)

