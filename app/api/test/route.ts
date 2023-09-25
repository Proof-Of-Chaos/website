function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const encoder = new TextEncoder();

async function* makeIterator() {
  yield encoder.encode("<p>One</p>");
  await sleep(2000);
  yield encoder.encode("<p>Two</p>");
  await sleep(2000);
  yield encoder.encode("<p>Three</p>");
}

export async function POST() {
  const iterator = makeIterator();
  const stream = iteratorToStream(iterator);

  return new Response(stream, {
    headers: {
      Connection: "keep-alive",
      // I saw somewhere that it needs to be set to 'none' to work in production on Vercel
      "Content-Encoding": "none",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    },
  });
}
