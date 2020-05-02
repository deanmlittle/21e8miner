const axios = require('axios');
const bsv = require('bsv');
const chalk = require('chalk');
const prompts = require('prompts');
const Message = require('bsv/message')
const PrivateKey = bsv.PrivateKey;
const Opcode = bsv.Opcode;
const Transaction = bsv.Transaction;
const BN = bsv.crypto.BN;
const config = loadConfig();

const sigtype = bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID
const signSigType = Buffer.from(sigtype.toString(16), 'hex')

const flags = bsv.Script.Interpreter.SCRIPT_VERIFY_MINIMALDATA | bsv.Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID | bsv.Script.Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES | bsv.Script.Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES;


function loadConfig(){
  let defaultConfig = {
    minerId: {
        enabled: false,
        privKey: "",
        message: ""
    },
    payto: "",
    autopublish: true
  }
  try {
    const userConfig = require('./config');
    return userConfig;
  } catch(e) {
    return defaultConfig
  }  
}

function is21e8Out(script) {
  return !!(
    script.chunks.length === 12 &&
    script.chunks[0].buf &&
    script.chunks[0].buf.length === 32 &&
    script.chunks[1].buf &&
    script.chunks[1].buf.length >= 1 &&
    script.chunks[2].opcodenum === Opcode.OP_SIZE &&
    script.chunks[3].opcodenum === Opcode.OP_4 &&
    script.chunks[4].opcodenum === Opcode.OP_PICK &&
    script.chunks[5].opcodenum === Opcode.OP_SHA256 &&
    script.chunks[6].opcodenum === Opcode.OP_SWAP &&
    script.chunks[7].opcodenum === Opcode.OP_SPLIT &&
    script.chunks[8].opcodenum === Opcode.OP_DROP &&
    script.chunks[9].opcodenum === Opcode.OP_EQUALVERIFY &&
    script.chunks[10].opcodenum === Opcode.OP_DROP &&
    script.chunks[11].opcodenum === Opcode.OP_CHECKSIG
  );
}

function sign(tx, target=''){
  const privKey = PrivateKey.fromRandom();
  const signature = Transaction.sighash.sign(tx, privKey, sigtype, 0, tx.inputs[0].output.script, new bsv.crypto.BN(tx.inputs[0].output.satoshis), flags)
  const sig256 = bsv.crypto.Hash.sha256(
    Buffer.concat([
      signature.toBuffer(),
      signSigType
    ])
  ).toString('hex')
  if (!sig256.startsWith(target)) {
    return false
  }
  const unlockingScript = new bsv.Script({});
  unlockingScript
    .add(
      Buffer.concat([
        signature.toBuffer(),
        Buffer.from([sigtype & 0xff])
      ])
    )
    .add(privKey.toPublicKey().toBuffer());
  tx.inputs[0].setScript(unlockingScript);
  console.log(chalk.green(`Signed ${target} with ${privKey.toString()}`));
  return tx;
}

const getTx = async txid => {
  try {
    const result = await axios.get(`https://api.whatsonchain.com/v1/bsv/main/tx/${txid}/hex`);
    return new Transaction(result.data);
  } catch (e) {
    throw new Error("TX not found.");
  }
}

const start = async() => {
  try {
    const {txid} = await prompts({
      type: 'text',
      name: 'txid',
      message: 'Target TXID'
    });
    // const {txid} = await prompt.get(["txid"]);
    // if(txid === 'exit') return; //let them exit
    if(!txid) {
      return;
    }
    const tx = await getTx(txid);
    
    let index = -1;
    for(let i=0; i<tx.outputs.length; i++) {
      if(is21e8Out(tx.outputs[i].script)){
        index = i;
        break;
      }
    }
    if(index<0){
      throw("No 21e8 outputs found");
    }
    let toAddress;
    if(config.payto){
      toAddress = config.payto;
    } else {
      let {to} = await prompts({
        type: 'text',
        name: 'to',
        message: 'Pay solved puzzle out to (1handle, $handle, PayMail or p2pkh address)'
      });
      if(!to){
        return;
      }
      if(!to.length){
        throw("No address found.");
      }
      toAddress = to;
    }
    try {
      const polynym = await axios.get(`https://api.polynym.io/getAddress/${toAddress}`);
      console.log(polynym.data.address);
      toAddress = polynym.data.address;
    } catch(e) {
      throw("Address not found");
    }
    try {
      toAddress = bsv.Script.buildPublicKeyHashOut(toAddress);
    } catch(e){
      throw("Invalid address");
    }
    console.log(chalk.green(`Mining TX ${txid} output ${index}`));
    console.log(chalk.green(`Pay to: ${toAddress}`));
    mineId(tx, index, toAddress, config.autopublish);
  } catch(e){
    console.log(chalk.red(e));
    start();
  }
}

const mineId = async(from, index, to, publish) => {
    const vout = from.outputs[index];
    const value = vout.satoshis;
    const target = vout.script.chunks[1].buf.toString("hex");

    console.log('script', vout.script.toASM())
  
    //Make initial TX
    let tx = new Transaction()
    tx.addInput(
      new Transaction.Input({
        output: new Transaction.Output({
          script: vout.script,
          satoshis: value
        }),
        prevTxId: from.hash,
        outputIndex: index,
        script: bsv.Script.empty()
      })
    );

    tx.addOutput(
      new Transaction.Output({
        satoshis: (config.minerId.enabled) ? value-300 : value-218,
        script: to
      })
    );

    if(config.minerId.enabled){
      const minerPriv = new PrivateKey.fromWIF(config.minerId.privKey);
      const minerPub = new bsv.PublicKey.fromPrivateKey(minerPriv);
      const sig = bsv.crypto.ECDSA.sign(Buffer.from(from.hash, 'hex'), minerPriv);
      const schema = {
        id: minerPub.toString('hex'),
        sig: sig.toString('hex'),
        message: config.minerId.message
      };
      tx.addOutput(new Transaction.Output({
        script: bsv.Script.buildSafeDataOut(JSON.stringify(schema)),
        satoshis: 0
      }));
    }

    console.log(chalk.green(`Targeting: ${target}`));
    let newTX;
    while(!newTX){
      newTX = sign(tx, target);
    }
    console.log(chalk.yellow(newTX.uncheckedSerialize()));
    if(!!publish){
      try {
        const {data} = await axios.post('https://api.whatsonchain.com/v1/bsv/main/tx/raw', { txhex: newTX.uncheckedSerialize() });
        console.log(chalk.green('Published ' + Buffer.from(newTX._getHash()).reverse().toString('hex')));
      } catch(e) {
        console.log(chalk.red(JSON.stringify({error: e.response.data})));
      }
    } else {
      return;
    }
}

start();
