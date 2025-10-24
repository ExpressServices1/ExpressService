// pingServer.ts
export const pingServer = async () => {
  try {
    await fetch("https://elated-rubia-expresservices1-7dc50fb7.koyeb.app/ping", {
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
