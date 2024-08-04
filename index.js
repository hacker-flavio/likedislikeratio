const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UCX6OQ3DkcsbYNE6H8uQQuVA"; // MrBeast's channel ID

async function getVideoDetails(videoId) {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          key: API_KEY,
          id: videoId,
          part: "contentDetails",
        },
      }
    );
    return response.data.items[0].contentDetails;
  } catch (error) {
    console.error(`Error fetching video details for video ${videoId}:`, error);
    return null;
  }
}

async function getVideoDislikeData(videoId) {
  try {
    const response = await axios.get(
      `https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching dislike data for video ${videoId}:`, error);
    return null;
  }
}

function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  return hours * 60 + minutes + seconds / 60;
}

async function getLatestVideos(channelId, maxResults = 20) {
  try {
    let videos = [];
    let nextPageToken = "";

    while (videos.length < maxResults) {
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            key: API_KEY,
            channelId: channelId,
            part: "snippet,id",
            order: "date",
            maxResults: 20,
            pageToken: nextPageToken,
          },
        }
      );

      const filteredVideos = response.data.items.filter(
        (item) => item.id.kind === "youtube#video"
      );

      for (let item of filteredVideos) {
        const videoId = item.id.videoId;
        const videoDetails = await getVideoDetails(videoId);
        const duration = parseDuration(videoDetails.duration);

        if (duration < 5) continue; // Skip videos shorter than 5 minutes

        const dislikeData = await getVideoDislikeData(videoId);

        const videoData = {
          channelId: item.snippet.channelId,
          title: item.snippet.title,
          videoId: videoId,
          publishedAt: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails.default.url,
          likes: dislikeData ? dislikeData.likes : "N/A",
          dislikes: dislikeData ? dislikeData.dislikes : "N/A",
          likeDislikeRatio: dislikeData
            ? dislikeData.likes > 0
              ? (dislikeData.dislikes / dislikeData.likes).toFixed(2)
              : "N/A"
            : "N/A",
        };

        videos.push(videoData);
        if (videos.length >= maxResults) break;
      }

      nextPageToken = response.data.nextPageToken;
      if (!nextPageToken) break;
    }

    // Save to JSON file
    fs.writeFileSync(
      "videos.json",
      JSON.stringify(videos.slice(0, maxResults), null, 2)
    );
    console.log("Video data saved to videos.json");
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
}

getLatestVideos(CHANNEL_ID);
