# linnstrument-playground

Selection of LinnStrument related scripts for my own use.
So far I haven't made anything nice / polished enough to be user friendly, sorry.

## Synthesia Light Guide

[Synthesia](https://synthesiagame.com/) offers a "Light Guide" feature for some keyboards.
LinnStrument is not directly supported, but with this script it's still possible to have it.

You need to have a virtual MIDI Loop Device (e.g. loopMIDI) where Synthesia sends KeyLights to the Output.
Use the "Finger based Channel" mode.
Set the name of the MIDI output port in the `synthesiaLightGuide.ts` options, or name your virtual device `Loop D`.

```sh
npx ts-node src/synthesiaLightGuide.ts
```

### TODO

* Does not support / detect transpose on the fly. 

### Exit User Mode

Sometimes my LinnStrument got stuck in user mode. This scripts puts it out of it.

```sh
node src/exitUserMode.js
```
