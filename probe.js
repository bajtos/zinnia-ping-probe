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
  console.log("RTT: %sms", duration);
}

function sleep(durationInMs) {
  return new Promise((resolve) => setTimeout(resolve, durationInMs));
}

while (true) {
  const peer = PEERS[Math.floor(Math.random() * PEERS.length)];
  console.log("Pinging %s", peer);
  try {
    await probe(peer);
  } catch (err) {
    console.error("Cannot ping %s: %s", peer, err);
  }
  await sleep(1000);
}
