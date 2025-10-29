// pingServer.ts
export const pingServer = async () => {
  try {
    await fetch("https://expressback-kylv.onrender.com/ping", {
      method: "GET",
      cache: "no-cache",
    });
    // Optional: Log if needed
    //console.log("Ping sent to backend");
  } catch (error) {
    // Fail silently, no need to alert the user
    //console.warn("Ping failed", error);
  }
};
