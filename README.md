# 21e8miner
Mine 21e8, or don't, whatever.

### Setup Miner ID
Run `node minerid` to configure your Miner ID and default payout settings

### Publish 21e8 jobs
Use this TX template with a certain output

```
<sha256 hash of something you want PoW for> <21e8 + target string in hex> OP_SIZE OP_4 OP_PICK OP_SHA256 OP_SWAP OP_SPLIT OP_DROP OP_EQUALVERIFY OP_DROP OP_CHECKSIG
```

Here's a jsfiddle to get you started: https://jsfiddle.net/fkt7qb15/

### Find jobs
You can listen for 21e8 jobs to mine here if you're fast enough

https://txo.bitsocket.network/socket/ewogICJ2IjogMywKICAicSI6IHsKICAgICJmaW5kIjogewogICAgICAib3V0LmgxIjogeyAiJHJlZ2V4IjogIi8yMWU4LyIgfSwKICAgICAgIm91dC5iMiI6IHsgIm9wIjogMTMwIH0sCiAgICAgICJvdXQuYjMiOiB7ICJvcCI6IDg0IH0sCiAgICAgICJvdXQuYjQiOiB7ICJvcCI6IDEyMSB9LAogICAgICAib3V0LmI1IjogeyAib3AiOiAxNjggfSwKICAgICAgIm91dC5iNiI6IHsgIm9wIjogMTI0IH0sCiAgICAgICJvdXQuYjciOiB7ICJvcCI6IDEyNyB9LAogICAgICAib3V0LmI4IjogeyAib3AiOiAxMTcgfSwKICAgICAgIm91dC5iOSI6IHsgIm9wIjogMTM2IH0sCiAgICAgICJvdXQuYjEwIjogeyAib3AiOiAxMTcgfSwKICAgICAgIm91dC5iMTEiOiB7ICJvcCI6IDE3MiB9CiAgICB9LAogICAgInByb2plY3QiOiB7ICJ0eC5oIjogMSB9CiAgfQp9

And you can see all previous jobs here if you're too slow

https://genesis.bitdb.network/query/1FnauZ9aUH2Bex6JzdcV4eNX7oLSSEbxtN/Cgp7CiAgInYiOiAzLAogICJxIjogewogICAgImZpbmQiOiB7CiAgICAgICJvdXQuaDEiOiB7ICIkcmVnZXgiOiAiLzIxZTgvIiB9LAogICAgICAib3V0LmIyIjogeyAib3AiOiAxMzAgfSwKICAgICAgIm91dC5iMyI6IHsgIm9wIjogODQgfSwKICAgICAgIm91dC5iNCI6IHsgIm9wIjogMTIxIH0sCiAgICAgICJvdXQuYjUiOiB7ICJvcCI6IDE2OCB9LAogICAgICAib3V0LmI2IjogeyAib3AiOiAxMjQgfSwKICAgICAgIm91dC5iNyI6IHsgIm9wIjogMTI3IH0sCiAgICAgICJvdXQuYjgiOiB7ICJvcCI6IDExNyB9LAogICAgICAib3V0LmI5IjogeyAib3AiOiAxMzYgfSwKICAgICAgIm91dC5iMTAiOiB7ICJvcCI6IDExNyB9LAogICAgICAib3V0LmIxMSI6IHsgIm9wIjogMTcyIH0KICAgIH0sCiAgICAicHJvamVjdCI6IHsgInR4LmgiOiAxIH0KICB9Cn0=

### Miner software
You can mine jobs from the cli. Just do this and follow the prompts
```
git clone https://github.com/deanmlittle/21e8miner.git
cd 21e8miner
npm i
node index
```

### Get a payout address from your PayMail
If you don't know how to get p2pkh addresses, use https://polynym.io

### What is 21e8?

Check the blockchain.
