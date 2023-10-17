import { validateHeaderValue } from "http";
import { Http2ServerResponse } from "http2";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

function iteratorToStream(iterator: AsyncIterableIterator<any>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        if (typeof value === "string") {
          controller.enqueue(`🔥string: ${value}`);
        } else if (typeof value === "object") {
          controller.enqueue(`🔥object: ${JSON.stringify(value)}`);
        } else {
          controller.enqueue(`🔥other: ${value}`);
        }
      }
    },
  });
}

function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

async function* makeIterator(encoder: TextEncoder) {
  yield encoder.encode(
    "🚀 Generating calls for reward distribution of referendum"
  );
  await sleep(2000);
  yield encoder.encode(`ℹ️  Getting all voting wallets for referendum`);
  await sleep(2000);
  yield encoder.encode(
    "↪ Checking for votes meeting requirements for referendum ${config.refIndex} with ${votes.length} votes."
  );
  await sleep(2000);
  yield encoder.encode(
    "↪ calculating distribution for referendum ${config.refIndex} with ${votes.length} votes."
  );
  await sleep(2000);
  yield encoder.encode(
    `📊 Total votes:  111, votes meeting requirements:222, votes not meeting requirements: 212`
  );
}

async function* generateCalls(refIndex: number, address: string) {
  yield `{ a: "some data from the function" }`;
  await sleep(2000);
  yield `{ a: "some other data from the function" }`;
  await sleep(2000);
  yield `{ a: "random ${refIndex} with address ${address}" }`;
  await sleep(2000);
  yield `{ a: "random ${refIndex} with address ${address}" }`;
}

async function* generateCalls2(refIndex: number, address: string) {
  yield "some 2e1231231 function";
  await sleep(2000);
  yield "some 123 12  other data from the function";
  await sleep(2000);
  yield `refe1 2312 3rendum ${refIndex} with address ${address}`;
  await sleep(2000);
  yield `{ "status": "success", "refIndex": [123,23]}`;
}

type ResponseData = {
  message: string;
};

async function* getDecoratedVotesWithInfo({ config }: { config: string }) {
  yield `getDecoratedVotesWithInfo with config ${config}`;
  await new Promise((resolve) => setTimeout(resolve, 500)); // Pause for 500ms
  yield "2";
  await new Promise((resolve) => setTimeout(resolve, 500)); // Pause for 500ms
  yield {
    decoratedVotes: ["v1", "v2", "v3"],
    distribution: { rare: 123, common: 123, epic: "123" },
  };
}

async function* getTxsReferendumRewards({
  decoratedVotes,
  distribution,
}: {
  decoratedVotes: string[];
  distribution: { rare: number; common: number; epic: string };
}) {
  await sleep(500);
  yield `getTxsReferendumRewards with decoratedVotes ${decoratedVotes} and distribution ${distribution}`;
  await sleep(500);
  yield "some other action is done";
  await sleep(500);
  yield { txsPerVote: 2, txsKusamaAssetHub: ["0x123", "0x456"] };
}

async function* generator2(data: any) {
  yield `generator2 with data ${data}`;
  await new Promise((resolve) => setTimeout(resolve, 500)); // Pause for 500ms
  yield "4";
  await new Promise((resolve) => setTimeout(resolve, 500)); // Pause for 500ms
}

async function* combinedGenerator() {
  const info = await getDecoratedVotesWithInfo({ config: "123" }); // Yield values from generator1 with pauses

  // if the next value returned from info is not a string, yield something
  // else, yield the value from info

  for await (const value of info) {
    console.log("value: ", value);
    if (typeof value !== "string") {
      yield* getTxsReferendumRewards(value);
    } else {
      yield value;
    }
  }
  // let valueFromFunc = (await info.next()).value;
  // console.log("valueFromFunc", valueFromFunc);
  // if (typeof valueFromFunc !== "string") {
  //   yield valueFromFunc;
  // }
  await sleep(2000);
  // yield* await generator2(); // Yield values from generator2 with pauses
}

// const encoder = new TextEncoder();
// const iterator = makeIterator(encoder);
async function* iterator() {
  yield "hello";
  // yield* await generateCalls(1, "0x123");
  yield* await generateCalls2(2, "0x123");
  await sleep(2000);
  yield* await generateCalls(3, "0x123");
  await sleep(2000);
  yield `{ any: "json", status: "done" }`;
}

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    console.log("post request");
  } else {
    console.log("not post request");
  }

  const stream = iteratorToStream(combinedGenerator());

  // iterator.next("hello");
  // iterator.next("🛠️");
  // iterator.next("hello");
  // iterator.next("🛠️");

  // if (!res.headersSent) {
  //   console.log("headers not sent yet");
  //   res.write("data: hello\n\n");
  //   sleep(2000);
  //   res.write("data: hello1\n\n");
  //   sleep(2000);
  //   res.write("data: hello2\n\n");
  //   sleep(2000);
  //   res.end();
  //   if (typeof res.writeHead === "function") {
  //     console.log("writeHead is function");
  //     // res.writeHead(200, {
  //     //   Connection: "keep-alive",
  //     //   // I saw somewhere that it needs to be set to 'none' to work in production on Vercel
  //     //   // "Content-Encoding": "none",
  //     //   "Cache-Control": "no-cache",
  //     //   "Content-Type": "text/event-stream",
  //     // });
  //   }
  // }

  return new Response(stream, {
    headers: {
      Connection: "keep-alive",
      // I saw somewhere that it needs to be set to 'none' to work in production on Vercel
      // "Content-Encoding": "none",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    },
  });

  // const rs = new ReadableStream({
  //   async start(controller) {
  //     controller.enqueue("hello");
  //     await sleep(2000);
  //     controller.enqueue("hello1");
  //     await sleep(2000);
  //     controller.enqueue("hello2");
  //     await sleep(2000);
  //   },
  // });

  // // add more data to the controller queue by piping the rs stream through another stream

  // // push data to rs

  // return new Response(rs2, {
  //   headers: {
  //     Connection: "keep-alive",
  //     // I saw somewhere that it needs to be set to 'none' to work in production on Vercel
  //     // "Content-Encoding": "none",
  //     "Cache-Control": "no-cache",
  //     "Content-Type": "text/event-stream",
  //   },
  // });
}
