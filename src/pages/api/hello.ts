import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.writeHead(200, {
    Connection: "keep-alive",
    // I saw somewhere that it needs to be set to 'none' to work in production on Vercel
    "Content-Encoding": "none",
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
  });

  let count = 0;
  res.write(`${JSON.stringify({ step: 0 })}`);

  const intervalId = setInterval(() => {
    count++;
    res.write(`${JSON.stringify({ step: count })}`);

    if (count === 100) {
      clearInterval(intervalId);
      res.end();
    }
  }, 1500);

  res.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
}
