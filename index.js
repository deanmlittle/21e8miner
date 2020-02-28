const axios = require('axios');
const bsv = require('bsv');
const chalk = require('chalk');
const prompt = require('prompt-async');
const PrivateKey = bsv.PrivateKey;
const Opcode = bsv.Opcode;
const Transaction = bsv.Transaction;
const BN = bsv.crypto.BN;


const sigtype = bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID;
const flags = bsv.Script.Interpreter.SCRIPT_VERIFY_MINIMALDATA | bsv.Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID | bsv.Script.Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES | bsv.Script.Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES;
  

function is21e8Out(input) {
  if (!input.output) {
    return false;
  }
  const script = input.output.script;
  return !!(
    script.chunks.length === 12 &&
    script.chunks[0].buf &&
    script.chunks[0].buf.length === 32 &&
    script.chunks[1].buf &&
    script.chunks[1].buf.length > 1 &&
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
  if(is21e8Out(tx.inputs[0])){
    const signature = Transaction.sighash.sign(tx, privKey, sigtype, 0, tx.inputs[0].output.script, new bsv.crypto.BN(tx.inputs[0].output.satoshis), flags);
    if(target!=''){
      const sig256 = bsv.crypto.Hash.sha256(Buffer.concat([signature.toBuffer(), Buffer.from('41', 'hex')])).toString('hex');
      if(!sig256.startsWith(target)){
        console.log(chalk.red(sig256));
        return(false);
      } else {
        console.log(chalk.green(sig256));
      }
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
  }
  console.log(chalk.green(`Signed ${target} with ${privKey.toString()}`));
  return tx;
}


const start = async() => {
  try {
    prompt.start();
    const {txid} = await prompt.get(["txid"]);
    if(txid === 'exit') return; //let them exit
    let tx;
    try {
      const {data} = await axios.get(`https://api.whatsonchain.com/v1/bsv/main/tx/hash/${txid}`);
      tx = data;
    } catch(e) {
      throw("TX not found.");
    }
    const {to} = await prompt.get(["to"]);
    if(txid === 'exit') return; //let them exit
    if(!to.length){
      throw("No address found.");
    }
    console.log(chalk.green(`Mining TX: ${txid}`));
    console.log(chalk.green(`Pay to: ${to}`));
    mineId(tx, to);
  } catch(e){
    console.log(chalk.red(e));
    start();
  }
}

const mineId = async(from, to) => {
    const vout = from.vout[0];
    const value = vout.value*1e8;
    const targetScript = bsv.Script.fromHex(vout.scriptPubKey.hex);
    const target = targetScript.toASM().split(" ")[1].toString('hex');

    //Make initial TX
    let tx = new Transaction();
    tx.addInput(
      new Transaction.Input({
        output: new Transaction.Output({
          script: targetScript,
          satoshis: value
        }),
        prevTxId: from.txid,
        outputIndex: 0,
        script: bsv.Script.empty()
      })
    );

    tx.addOutput(
      new Transaction.Output({
        satoshis: value-150,
        script: bsv.Script.buildPublicKeyHashOut(to)
      })
    );

    console.log(chalk.green(`Targeting: ${target}`));
    let newTX;
    while(!newTX){
      newTX = sign(tx, target);
    }
    console.log(chalk.yellow(newTX.uncheckedSerialize()));
}

start();