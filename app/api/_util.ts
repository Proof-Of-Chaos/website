export function iteratorToStream(iterator: any) {
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

export async function* makeIterator(encoder: TextEncoder) {
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
