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