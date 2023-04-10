import * as easyMidi from 'easymidi'

//////////////////////////////////////////
// OPTIONS                              //
//////////////////////////////////////////

const lightsInputPort = 'Loop D'
const linnStrumentOutputPort = 'LinnStrument MIDI'
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
//                                      //
//////////////////////////////////////////

// console.log(easyMidi.getInputs())
// console.log(easyMidi.getOutputs())

const input = new easyMidi.Input(lightsInputPort);
const output = new easyMidi.Output(linnStrumentOutputPort)

resetGrid()

const grid = generateGrid(rowOffset, startNoteNumber)
console.log(`Initialized with layout: Offset: ${rowOffset}, Start Note: ${startNoteNumber}`)

input.on('noteon', onNoteOn);
input.on('noteoff', onNoteOff);

function onNoteOn(msg: easyMidi.Note) {
  let logMsg = `Guide Note: ${msg.note.toString().padStart(3, '0')} | Highlighted on:`
  const noteCoords = grid[msg.note]
  for (const noteCoord of noteCoords) {
    highlightNote(noteCoord[0], noteCoord[1], highlightColor)
    logMsg += ` [${noteCoord[0].toString().padStart(2, '0')}, ${noteCoord[1].toString().padStart(2, '0')}]`
  }
  console.log(logMsg)
}
function onNoteOff(msg: easyMidi.Note) {
  const noteCoords = grid[msg.note]
  for (const noteCoord of noteCoords) {
    highlightNote(noteCoord[0], noteCoord[1], 0)
  }
}

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