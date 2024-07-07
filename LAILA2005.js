const embeddedPlayerApiKey = 'AIzaSyDGPBNuvA4huZMS07m7a5GV3CuPoxLdsAE';
const youtubeApiUrl = 'https://www.googleapis.com/youtube/v3/videos';

document.getElementById('send').addEventListener('click', sendMessage);

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    const output = document.getElementById('output');

    if (message === '') return;

    const newMessage = document.createElement('div');
    newMessage.classList.add('message');

    const youtubeRegex = /(https?:\/\/www\.youtube\.com\/watch\?v=|https?:\/\/youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = message.match(youtubeRegex);

    if (match) {
        const videoId = match[2];

        // Fetch video metadata using YouTube Data API v3
        fetch(`${youtubeApiUrl}?part=snippet&id=${videoId}&key=${embeddedPlayerApiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const videoTitle = data.items[0].snippet.title;
                newMessage.innerHTML = `
                    <div class="video-thumbnail" onclick="playVideo('${videoId}', this)">
                        <img src="https://img.youtube.com/vi/${videoId}/0.jpg" alt="YouTube Video Thumbnail">
                        <div>${videoTitle}</div>
                    </div>
                    <div class="video-container">
                        <div id="player-${videoId}" class="player"></div>
                    </div>
                `;
                output.appendChild(newMessage);
                messageInput.value = '';
                output.scrollTop = output.scrollHeight;

                // Load embedded player
                loadEmbeddedPlayer(videoId);
            })
            .catch(error => {
                console.error('Error fetching video metadata:', error);
                newMessage.textContent = 'Error loading video';
                output.appendChild(newMessage);
                messageInput.value = '';
                output.scrollTop = output.scrollHeight;
            });
    } else {
        newMessage.textContent = message;
        output.appendChild(newMessage);
        messageInput.value = '';
        output.scrollTop = output.scrollHeight;
    }
}

function loadEmbeddedPlayer(videoId) {
    new YT.Player(`player-${videoId}`, {
        height: '315',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 0, // Disable autoplay
            'controls': 1, // Show player controls
            'rel': 0,      // Do not show related videos
            'modestbranding': 1 // Use modest branding
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    // Additional actions when the player is ready
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        // Track user interaction or perform other actions when video starts playing
        trackVideoEvent('play', event.target.getVideoData().video_id);
    }
    if (event.data === YT.PlayerState.PAUSED) {
        // Track user interaction when video is paused
        trackVideoEvent('pause', event.target.getVideoData().video_id);
    }
    if (event.data === YT.PlayerState.ENDED) {
        // Track user interaction when video ends
        trackVideoEvent('ended', event.target.getVideoData().video_id);
    }
}

function trackVideoEvent(action, videoId) {
    // Implement tracking logic here, e.g., send event to analytics platform
    console.log(`Video ${action}: ${videoId}`);
}

function playVideo(videoId, element) {
    const player = document.getElementById(`player-${videoId}`);
    player.style.display = 'block';
    element.style.display = 'none';
}
