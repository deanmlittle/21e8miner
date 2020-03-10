const prompts = require('prompts'),
fs = require('fs'),
chalk = require('chalk'),
bsv = require('bsv');

//Generate new private key
let newPrivKey = bsv.PrivateKey.fromRandom();
newPrivKey = newPrivKey.toWIF();
// minerId: {
//     enabled: true,
//     privKey: "L2QhLR3D33zE9jWVzids2qGuNyxM2DtGX6kx5RQS3d3Am3krtKvh", //privateKey in WIF format
//     message: "利"
// },
// payto: "deanlittle@moneybutton.com",
// autopublish: true

const questions = [
  {
    type: 'confirm',
    name: 'enabled',
    message: 'Enable Miner API?',
    default: true
  },
  {
    type: 'text',
    name: 'privkey',
    message: 'Private key in WIF format',
    initial: newPrivKey
  },
  {
    type: 'text',
    name: 'message',
    message: 'Select a message for Miner API'
  },
  {
    type: 'text',
    name: 'payto',
    message: 'Pay solved puzzles out to (1handle, $handle, PayMail or p2pkh address)'
  },
  {
    type: 'confirm',
    name: 'autopublish',
    message: 'Automatically publish solved puzzles?',
    default: true
  }
];
 
(async () => {
  const response = await prompts(questions);
    const config = {
        minerId: {
            enabled: response.enabled,
            privKey: response.privkey,
            message: response.message
        },
        payto: response.payto,
        autopublish: response.autopublish
    }
    fs.writeFile("config.js", 'module.exports = ' + JSON.stringify(config, null, 4).replace(/\"([^(\")"]+)\":/g,"$1:"), 'utf8', function (err) {
        if (err) {
            console.log(chalk.red("An error occured while writing config file. :("));
            return console.log(err);
        }
        let config2 = config;
        config2.minerId.privKey = config2.minerId.privKey.replace(/./gi,"*");
        console.log(chalk.green("Config file saved! :)"));
        console.log(JSON.stringify(config2, null, 4));
    });
})();