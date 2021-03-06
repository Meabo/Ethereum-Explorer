const API_KEY_ETHERSCAN = "J37NT5P6M4PH4UXBS1HN7EKMBTG4P6M765";
const API_KEY_CRYPTOCOMPARE =
  "5346ae8fe89768ec4af346545896245c6704aa251d04daff25d36ae46830e9c5";
export const isValidEthereum = (address) => {
  return address ? address.match(/^0x[0-9a-fA-F]{40}$/) : null;
};

export const getPrice = async (symbol, currency) => {
  const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=${currency}&api_key=${API_KEY_CRYPTOCOMPARE}`;
  const response = await fetch(url);
  return response.json();
};

export const getEtherBalance = (address) => {
  const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY_ETHERSCAN}`;
  return fetch(url).then(async (r) => {
    return r.json();
  });
};

export const fetchTxs = async (address, batch_size) => {
  const fetchTxsPage = (address, block) => {
    const url = `http://eth-mainnet.explorers.prod.aws.ledger.fr/blockchain/v3/addresses/${address}/transactions?batch_size=${batch_size}&partial=true&no_token=true${
      block ? "&block_hash=" + block : ""
    }`;
    console.log("GET", url);
    return fetch(url).then(async (r) => {
      if (!r.ok) {
        const res = await r.text();
        throw res;
      }
      return r.json();
    });
  };

  console.log(`fetching txs for ${address}`);
  let {txs} = await fetchTxsPage(address);
  while (true) {
    const last = txs[txs.length - 1];
    if (!last) break;
    const {block} = last;
    if (!block) break;
    const next = await fetchTxsPage(address, block.hash);
    const nextTxs = next.txs.filter(
      (tx) => !txs.some((t) => t.hash === tx.hash)
    );
    if (nextTxs.length === 0) break;
    txs = txs.concat(nextTxs);
  }
  txs.reverse();
  console.log(`finished fetching ${txs.length} txs for ${address}`);
  return txs;
};

export const txsToOperations = async (txs, address) => {
  const ops = [];
  const addressToLowerCase = address.toLowerCase();
  const res = await Promise.all(
    txs.map((tx) => {
      return new Promise((resolve, reject) => {
        const fee = tx.gas_price * tx.gas_used;
        const sending = addressToLowerCase === tx.from;
        const receiving = addressToLowerCase === tx.to;
        const value = tx.value;
        if (sending) {
          ops.push({
            symbol: "ETH",
            magnitude: 18,
            id: `${tx.hash}-OUT`,
            hash: tx.hash,
            type: "OUT",
            value: value + fee,
            address: tx.to,
            date: new Date(tx.received_at)
          });
        }
        if (receiving) {
          ops.push({
            symbol: "ETH",
            magnitude: 18,
            id: `${tx.hash}-IN`,
            hash: tx.hash,
            type: "IN",
            value,
            address: tx.from,
            date: new Date(tx.received_at)
          });
        }
        const transfers = tx.transfer_events.list;
        transfers.map((event, j) => {
          if (event.symbol) {
            const symbol = event.symbol.match(/([^ ]+)/g)[0];
            const sending = addressToLowerCase === event.from;
            const receiving = addressToLowerCase === event.to;
            const value = event.count;
            if (sending) {
              ops.push({
                symbol,
                magnitude: event.decimal,
                id: `${tx.hash}-${j}-OUT`,
                hash: tx.hash,
                type: "OUT",
                value,
                address: event.to,
                date: new Date(tx.received_at)
              });
            }
            if (receiving) {
              ops.push({
                symbol,
                magnitude: event.decimal,
                id: `${tx.hash}-${j}-IN`,
                hash: tx.hash,
                type: "IN",
                value,
                address: event.from,
                date: new Date(tx.received_at)
              });
            }
          }
        });
        return resolve();
      });
    })
  );
  const paginatedArray = await paginate(ops);
  return paginatedArray;
};

async function paginate(arr) {
  return new Promise((resolve, reject) => {
    if (arr) {
      const chunk_size = 20;
      const r = arr.reduce((r, e, i) => {
        i % chunk_size === 0 ? r.push([e]) : r[r.length - 1].push(e);
        return r;
      }, []);
      return resolve({groups: r, total: arr});
    }
  });
}

export const getTokenBalances = (operations) => {
  const balances = {};
  const mergedBalanceAndMagnitude = {};
  operations
    .filter((op) => op.symbol !== "ETH")
    .map((op) => {
      balances[op.symbol] =
        (balances[op.symbol] || 0) + (op.type === "OUT" ? -op.value : op.value);
      mergedBalanceAndMagnitude[op.symbol] = formatValue(
        balances[op.symbol],
        op.magnitude
      );
    });
  return mergedBalanceAndMagnitude;
};

function getUnique(arr) {
  return [...new Set(arr.map((item) => item.symbol))];
}

export const getTokenBalancesWithPrices = async (operations, symbol) => {
  const mergedData = {};
  let unique;
  if (operations && operations.length > 0) unique = getUnique(operations);

  if (unique && unique.length > 0 && operations.length > 0) {
    const tokenPrices = {};
    const balances = {};

    await Promise.all(
      unique
        .filter((e) => e !== "ETH")
        .map((e) => {
          return new Promise(async (resolve, reject) => {
            let price = await getPrice(e, symbol);
            tokenPrices[e] = {symbol: e, unit_price: price.USD};
            return resolve();
          });
        })
    );
    await Promise.all(
      operations
        .filter((op) => op.symbol !== "ETH")
        .map((op) => {
          return new Promise(async (resolve, reject) => {
            balances[op.symbol] =
              (balances[op.symbol] || 0) +
              (op.type === "OUT" ? -op.value : op.value);
            const price = tokenPrices[op.symbol].unit_price;
            mergedData[op.symbol] = {
              symbol: op.symbol,
              balance: formatValue(balances[op.symbol], op.magnitude),
              unit_price: !price ? "No data" : price,
              total_usd: !price
                ? "No data"
                : formatValue(balances[op.symbol], op.magnitude) * price
            };

            return resolve();
          });
        })
    );
  }

  return mergedData;
};

export const formatValue = (value, magnitude) => {
  const val = (value / Math.pow(10, magnitude)).toFixed(6);
  return val;
};
