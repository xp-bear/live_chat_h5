const http = require("http");
http
  .get("http://localhost:5201/api/oss_status", (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log("STATUS", res.statusCode);
      console.log("HEADERS", res.headers);
      console.log("BODY", data);
    });
  })
  .on("error", (err) => {
    console.error("ERR", err.message);
  });
