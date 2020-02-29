# 21e8miner
Mine 21e8, or don't, whatever.

### Publish 21e8 jobs
Use this TX template with a certain output
`<sha256 hash of something you want PoW for> <21e8 + target string in hex> OP_SIZE OP_4 OP_PICK OP_SHA256 OP_SWAP OP_SPLIT OP_DROP OP_EQUALVERIFY OP_DROP OP_CHECKSIG`
Here's a jsfiddle to help you get started: https://jsfiddle.net/fkt7qb15/

### Find jobs
You can mine 21e8 jobs here if you're fast enough
https://genesis.bitdb.network/query/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/Cgp7CiAgInYiOiAzLAogICJxIjogewogICAgImZpbmQiOiB7CiAgICAgICJvdXQuaDEiOiB7ICIkcmVnZXgiOiAiLzIxZTgvIiB9LAogICAgICAib3V0LmIyIjogeyAib3AiOiAxMzAgfSwKICAgICAgIm91dC5iMyI6IHsgIm9wIjogODQgfSwKICAgICAgIm91dC5iNCI6IHsgIm9wIjogMTIxIH0sCiAgICAgICJvdXQuYjUiOiB7ICJvcCI6IDE2OCB9LAogICAgICAib3V0LmI2IjogeyAib3AiOiAxMjQgfSwKICAgICAgIm91dC5iNyI6IHsgIm9wIjogMTI3IH0sCiAgICAgICJvdXQuYjgiOiB7ICJvcCI6IDExNyB9LAogICAgICAib3V0LmI5IjogeyAib3AiOiAxMzYgfSwKICAgICAgIm91dC5iMTAiOiB7ICJvcCI6IDExNyB9LAogICAgICAib3V0LmIxMSI6IHsgIm9wIjogMTcyIH0KICAgIH0KICB9Cn0=

### Miner software
You can mine jobs from the cli. Just do this and follow the prompts
```
git clone https://github.com/deanmlittle/21e8miner.git
cd 21e8miner
npm i
node index
```

If you don't know what 21e8 is, check the blockchain.
