const { WebMidi } = require('webmidi')

WebMidi.enable(async (err) => {

  if (err) {
    console.log("WebMidi could not be enabled.", err);
  } else {
    console.log("WebMidi enabled!");

    // var input = WebMidi.getInputByName("LinnStrument MIDI");
    var output = WebMidi.getOutputById("LinnStrument MIDI");

    output.sendNrpnValue([1, 117], [0, 1], { channels: 1 });
    await sleep(20)
    output.sendNrpnValue([1, 117], [0, 0], { channels: 1 });
    await sleep(20)

    console.log('Done.')
    process.exit()
  }
  
});

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

function convertNRPNtoCC(nrpnMsg) {
  // Extract the NRPN parameter number and value from the message
  const nrpnParam = nrpnMsg[1] << 7 | nrpnMsg[2];
  const nrpnValue = nrpnMsg[4] << 7 | nrpnMsg[5];

  // Convert the NRPN parameter number to a CC number (add 32)
  const ccNumber = nrpnParam + 32;

  // Calculate the MSB and LSB values for the CC message from the NRPN value
  const ccValueMSB = nrpnValue >> 7;
  const ccValueLSB = nrpnValue & 0x7F;

  // Return an array of two CC messages (MSB and LSB)
  return [    [0xB0, ccNumber, ccValueMSB],
    [0xB0, ccNumber + 32, ccValueLSB]
  ];
}