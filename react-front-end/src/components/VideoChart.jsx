import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const VideoChart = () => {
  const [chartDataWithImages, setChartDataWithImages] = useState(null);
  const [chartDataWithoutImages, setChartDataWithoutImages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the JSON data
    fetch("/videos.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data && Array.isArray(data)) {
          const dates = data.map((video) =>
            new Date(video.publishedAt).toLocaleDateString()
          );
          const ratios = data.map((video) =>
            parseFloat(video.likeDislikeRatio)
          );
          const thumbnails = data.map((video) => video.thumbnail);

          const thumbnailImages = thumbnails.map((url) => {
            const img = new Image();
            img.src = url;
            img.width = 72; // Increase thumbnail size
            img.height = 72;
            return img;
          });

          setChartDataWithImages({
            labels: dates,
            datasets: [
              {
                label: "Dislike to Like Ratio",
                data: ratios,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                pointRadius: 20, // Increase point radius to match thumbnail size
                pointStyle: thumbnailImages,
              },
            ],
          });

          setChartDataWithoutImages({
            labels: dates,
            datasets: [
              {
                label: "Dislike to Like Ratio",
                data: ratios,
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                borderColor: "rgba(255, 0, 0, 1)",
                borderWidth: 3, // Thicker line
                pointRadius: 0, // No points
              },
            ],
          });
        } else {
          console.error("Data is not in the expected format:", data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching the JSON file:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading data...</p>;
  }

  return (
    <div>
      <h2>Video Like to Dislike Ratio</h2>
      {chartDataWithImages && chartDataWithoutImages ? (
        <div style={{ position: "relative", width: "1500px", height: "800px" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "white",
            }}
          >
            <Line
              data={chartDataWithImages}
              options={{
                layout: {
                  padding: {
                    left: 50,
                    right: 50,
                    top: 50,
                    bottom: 50,
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Date",
                    },
                    ticks: {
                      padding: 20, // Add padding between dates and the graph
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Dislike to Like Ratio",
                    },
                    ticks: {
                      color: "black",
                      font: {
                        size: 12,
                        weight: "bold",
                      },
                      padding: 15,
                      callback: function (value) {
                        return value.toFixed(2); // Display the ratio as a decimal with two decimal places
                      },
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return ` ${context.raw.toFixed(2)}`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <Line
              data={chartDataWithoutImages}
              options={{
                layout: {
                  padding: {
                    left: 50,
                    right: 50,
                    top: 50,
                    bottom: 50,
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Date",
                    },
                    ticks: {
                      padding: 20, // Add padding between dates and the graph
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Dislike to Like Ratio",
                    },
                    ticks: {
                      callback: function (value) {
                        return value.toFixed(2); // Display the ratio as a decimal with two decimal places
                      },
                      color: "black",
                      font: {
                        size: 12,
                        weight: "bold",
                      },
                      padding: 15,
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return ` ${context.raw.toFixed(2)}`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default VideoChart;
