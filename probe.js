const INFLUXDB_API_KEY = "FILL ME IN!";
const INFLUXDB_ORG_ID = "FILL ME IN!";
const INFLUXDB_BUCKET = "FILL ME IN!";
const INFLUXDB_ENDPOINT = "https://eu-central-1-1.aws.cloud2.influxdata.com/";

// List of peers to ping
const PEERS = [
  // Punchr bootstrap nodes
  // https://github.com/libp2p/punchr/blob/b43900e079e654b964531ea6a0b4531c18265b8e/rust-client/src/main.rs#L275-L287
  "/ip4/139.178.91.71/tcp/4001/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",

  // https://github.com/mxinden/kademlia-exporter/blob/9fea15bc50ae50637033d5437ebb21aa53959e73/config.toml#L6-L9
  "/ip4/139.178.91.71/tcp/4001/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",

  // ipfs bootstrap
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
  "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",

  // https://github.com/bajtos/saturn-interop-libp2p
  "/dns/saturn-link-poc.fly.dev/tcp/3030/p2p/12D3KooWRH71QRJe5vrMp6zZXoH4K7z5MDSWwTXXPriG9dK8HQXk",
];

async function probe(peer) {
  const requestPayload = new Uint8Array(32);
  crypto.getRandomValues(requestPayload);
  const started = Date.now();
  await Zinnia.requestProtocol(peer, "/ipfs/ping/1.0.0", requestPayload);
  const duration = Date.now() - started;
  return { started, duration };
}

async function record({ peer, started, duration }) {
  const request_url = new URL("/api/v2/write", INFLUXDB_ENDPOINT);
  request_url.searchParams.set("org", INFLUXDB_ORG_ID);
  request_url.searchParams.set("bucket", INFLUXDB_BUCKET);
  request_url.searchParams.set("precision", "ms");
  const res = await fetch(request_url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Token ${INFLUXDB_API_KEY}`,
      "Content-Type": "text/plain; charset=utf-8",
    },
    body: `ping_rtt,peer=${peer} rtt=${duration}u ${started}\n`,
  });
  if (!res.ok) {
    throw new Error(`InfluxDB API error ${res.status}\n${await res.text()}`);
  }
}

function sleep(durationInMs) {
  return new Promise((resolve) => setTimeout(resolve, durationInMs));
}

while (true) {
  const peer = PEERS[Math.floor(Math.random() * PEERS.length)];

  let pingResult;

  try {
    console.log("Pinging %s", peer);
    pingResult = await probe(peer);
    console.log("RTT: %sms", pingResult.duration);
  } catch (err) {
    console.error("Cannot ping %s: %s", peer, err);
  }

  try {
    await record({ peer, ...pingResult });
    console.log("Submitted stats to InfluxDB.");
  } catch (err) {
    console.error("Cannot record stats: %s", err);
  }

  await sleep(1000);
}
