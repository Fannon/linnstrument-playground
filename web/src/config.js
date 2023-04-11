
import { ext } from './main.js'

export function initConfig() {
  ext.config = ext.defaultConfig
  const userConfig = localStorage.getItem("config");
  
  if (userConfig) {
    ext.config = {
      ...ext.defaultConfig,
      ...JSON.parse(userConfig)
    }
  }

  // instrumentInputPort
  WebMidi.inputs.forEach((device) => {
    const option = document.createElement("option");
    option.text = device.name; 
    if (ext.config.instrumentInputPort === device.name) {
      option.selected = true
    } 
    document.getElementById('instrumentInputPort').add(option)
  });

  // instrumentOutputPort
  WebMidi.outputs.forEach((device) => {
    const option = document.createElement("option");
    option.text = device.name; 
    if (ext.config.lightGuideInputPort === device.name) {
      option.selected = true
    } 
    document.getElementById('instrumentOutputPort').add(option)
  });
  // lightGuideInputPort
  WebMidi.inputs.forEach((device) => {
    const option = document.createElement("option");
    option.text = device.name; 
    if (ext.config.lightGuideInputPort === device.name) {
      option.selected = true
    } 
    document.getElementById('lightGuideInputPort').add(option)
  });
  // forwardPort1
  WebMidi.outputs.forEach((device) => {
    const option = document.createElement("option");
    option.text = device.name; 
    if (ext.config.forwardPort1 === device.name) {
      option.selected = true
    } 
    document.getElementById('forwardPort1').add(option)
  });
  // forwardPort2
  const noValue = document.createElement("option");
  noValue.text = ''; 
  document.getElementById('forwardPort2').add(noValue)
  WebMidi.outputs.forEach((device) => {
    const option = document.createElement("option");
    option.text = device.name; 
    if (ext.config.forwardPort2 === device.name) {
      option.selected = true
    } 
    document.getElementById('forwardPort2').add(option)
  });

  console.debug('Config', ext.config)
}

export function saveConfig(event) {
  event.preventDefault() 
  ext.config.instrumentInputPort = document.getElementById("instrumentInputPort").value;
  ext.config.instrumentOutputPort = document.getElementById("instrumentOutputPort").value;
  ext.config.lightGuideInputPort = document.getElementById("lightGuideInputPort").value;
  ext.config.forwardPort1 = document.getElementById("forwardPort1").value;
  ext.config.forwardPort2 = document.getElementById("forwardPort2").value;
  localStorage.setItem("config", JSON.stringify(ext.config));
  location.reload()
}

export function resetConfig(event) {
  event.preventDefault() 
  localStorage.removeItem("config")
  location.reload()
}
