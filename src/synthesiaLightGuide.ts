import * as easyMidi from 'easymidi'
import * as fs from 'fs-extra'

//////////////////////////////////////////
// OPTIONS                              //
//////////////////////////////////////////

const lightsInputPort = 'Loop D'
const linnStrumentInputPort = 'LinnStrument MIDI'
const linnStrumentOutputPort = 'LinnStrument MIDI'
const forwardOutputPorts = ['Loop A', 'Loop E']
/**
 *  Color Values
    ============
    0   as set in Note Lights settings
    1   Red
    2   Yellow
    3   Green
    4   Cyan
    5   Blue
    6   Magenta
    7   Off
    8   White
    9   Orange
    10  Lime
    11  Pink
 */
const highlightColor = 6
const linnStrumentColumns = 16
const rowOffset = 5
const startNoteNumber = 30
const transpose = 0

//////////////////////////////////////////
// BOOTSTRAP                            //
//////////////////////////////////////////

// console.log(easyMidi.getInputs())
// console.log(easyMidi.getOutputs())

console.log(`==================================================================`)
console.log(`LinnStrument Synthesia Light Guide`)
console.log(`==================================================================`)
console.log(`LinnStrument MIDI Input:`.padEnd(30, ' '), linnStrumentInputPort)
const input = new easyMidi.Input(linnStrumentInputPort)
console.log(`LinnStrument MIDI Output:`.padEnd(30, ' '), linnStrumentOutputPort)
const output = new easyMidi.Output(linnStrumentOutputPort)
console.log(`Light Guide MIDI Input:`.padEnd(30, ' '), lightsInputPort)
const lightGuideInput = new easyMidi.Input(lightsInputPort);

resetGrid()

const grid = generateGrid(rowOffset, startNoteNumber)
console.log(`Initialized with layout:`.padEnd(30, ' '), `Offset: ${rowOffset}, Start Note: ${startNoteNumber}`)

interface NoteHistory {
  time: number,
  note: number,
}

const playedNotesStatistics: NoteHistory[] = []
const guideNotesStatistics: NoteHistory[] = []

//////////////////////////////////////////
// REGISTER CALLBACKS                   //
//////////////////////////////////////////

lightGuideInput.on('noteon', (msg) => {
  guideNotesStatistics.push({
    time: Date.now(),
    note: msg.note,
  })
  let logMsg = `Guide Note: ${msg.note.toString().padStart(3, '0')} | Highlighted on:`
  const noteCoords = grid[msg.note]
  for (const noteCoord of noteCoords) {
    highlightNote(noteCoord[0], noteCoord[1], highlightColor)
    logMsg += ` [${noteCoord[0].toString().padStart(2, '0')}, ${noteCoord[1].toString().padStart(2, '0')}]`
  }
  console.log(logMsg)
});
lightGuideInput.on('noteoff', (msg) => {
  const noteCoords = grid[msg.note]
  for (const noteCoord of noteCoords) {
    highlightNote(noteCoord[0], noteCoord[1], 0)
  }
});

console.log(`------------------------------------------------------------------`)

const forwardPorts: easyMidi.Output[] = []

for (const forwardOutputPort of forwardOutputPorts) {
  const forwardOutput = new easyMidi.Output(forwardOutputPort)
  forwardPorts.push(forwardOutput)
  console.log(`LinnStrument MIDI Forward:`.padEnd(30, ' '), forwardOutputPort)
}

input.on('noteon', (msg) => {
  console.debug(midiToNoteName(msg.note), msg)
  playedNotesStatistics.push({
    time: Date.now(),
    note: msg.note,
  })
  forwardPorts.forEach((output) => {
    output.send("noteon", msg)
  })
})

input.on('noteoff', (msg) => {
  forwardPorts.forEach((output) => {
    output.send("noteoff", msg)
  })
})
input.on('cc', (msg) => {
  console.log(`Input CC`, msg)
  forwardPorts.forEach((output) => {
    output.send("cc", msg)
  })
})
input.on('sysex', (msg) => {
  console.log(`Input SYSEX`, msg)
})

process.on('SIGINT', function () {
  console.log('Exiting');
  console.log('Resetting Lights...');
  resetGrid()
  console.log('Writing Statistics...');
  fs.outputJSONSync('./statistics/stats.json', {
    guideNotesStatistics: guideNotesStatistics,
    playedNotesStatistics: playedNotesStatistics,
  })
  process.exit()
});

console.log(`------------------------------------------------------------------`)


//////////////////////////////////////////
// REPL                                 //
//////////////////////////////////////////

//////////////////////////////////////////
// PLAYGROUND                           //
//////////////////////////////////////////

// Not yet working
// sendNRPN(245, 1);
// sendNRPN(245, 0);


//////////////////////////////////////////
// HELPER FUNCTIONS                     //
//////////////////////////////////////////

function highlightNote(x: number, y: number, color: number) {
  // console.debug(`Highlighting`, x.toString().padStart(2, '0'), y.toString().padStart(2, '0'), color)
  output.send('cc', {
    controller: 20,
    value: x,
    channel: 1,
  })
  output.send('cc', {
    controller: 21,
    value: y,
    channel: 1,
  })
  output.send('cc', {
    controller: 22,
    value: color,
    channel: 1,
  })
}

function sendNRPN(nrpn: number, value: number) {
  
  const one = convertNRPNValueToMSBLSB(nrpn)
  const two = convertNRPNValueToMSBLSB(value)
  console.log(one, two)

  // Setting the NRPN number
  output.send('cc', {
    controller: 98,
    value: one[0],
    channel: 1,
  })
  output.send('cc', {
    controller: 98,
    value: one[1],
    channel: 1,
  })
  // Setting the NRPN Value
  output.send('cc', {
    controller: 38,
    value: two[0],
    channel: 1,
  })
  output.send('cc', {
    controller: 6,
    value: two[1],
    channel: 1,
  })
  // Reset RPN parameter
  output.send('cc', {
    controller: 101,
    value: 127,
    channel: 1,
  })
  output.send('cc', {
    controller: 100,
    value: 127,
    channel: 1,
  })
}

/**
 * Calculate the grid for the LinnStrument
 * where each MIDI note can be found by x and y coordinates
 * 
 * @param halfToneSteps How many half tone steps the layout has
 * @param startNoteNumber Which midi note the grid starts with (bottom left corner)
 * @returns 
 */
function generateGrid(halfToneSteps: number = 5, startNoteNumber: number = 30): { [noteNumber: string]: number[][] } {

  startNoteNumber += (transpose + (transpose * 12))

  // First generate the grid with the note numbers as it is on the LinnStrument
  const grid: number[][] = []

  for (let x = 0; x <= linnStrumentColumns; x++ ) {
    grid[x] = []
    for (let y = 0; y <= 7; y++ ) {
      grid[x][y] = startNoteNumber + x + (y * halfToneSteps)
    }
  }

  // Now create a dictionary that lists me all grid coordinates for a given note
  // This is used to speed up the access to find the coordinates
  const gridDict: { [noteNumber: string]: number[][] } = {}
  
  for (let note = startNoteNumber; note <= 127; note++ ) {
    gridDict[note] = []
    for (let x = 0; x <= linnStrumentColumns; x++ ) {
      for (let y = 0; y <= 7; y++ ) {
        if (grid[x][y] === note) {
          gridDict[note].push([x + 1, y])
        }
      }
    }
  }

  return gridDict;
}

/**
 * Helper function that resets all color highlights from the grid
 * by brute force
 */
function resetGrid() {
  for (let x = 0; x <= linnStrumentColumns; x++ ) {
    for (let y = 0; y <= 7; y++ ) {
      highlightNote(x, y, 0)
    }
  }
}

function convertNRPNtoCC(nrpnMsg: number[]): number[][] {
  // Extract the NRPN parameter number and value from the message
  const nrpnParam = (nrpnMsg[1] << 7) | nrpnMsg[2];
  const nrpnValue = (nrpnMsg[4] << 7) | nrpnMsg[5];

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

function convertNRPNValueToMSBLSB(nrpnValue: number): [number, number] {
  const msb = nrpnValue >> 7;
  const lsb = nrpnValue & 0x7F;
  return [msb, lsb];
}

function midiToNoteName(midiNote: number): string {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor((midiNote - 12) / 12) - 1;
  const noteIndex = midiNote % 12;
  return notes[noteIndex] + octave.toString();
}