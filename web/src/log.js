export const log = {
  info: (msg) => {
    console.info(msg)
    const logEntry = document.createElement("div");
    logEntry.classList = 'log-entry log-info'
    const textNode = document.createTextNode(msg);
    logEntry.appendChild(textNode);
    document.getElementById("log").appendChild(logEntry);
  },
  warn: (msg) => {
    console.warn(msg)
    const logEntry = document.createElement("div");
    logEntry.classList = 'log-entry log-warn'
    const textNode = document.createTextNode(msg);
    logEntry.appendChild(textNode);
    document.getElementById("log").appendChild(logEntry);
  },
  error: (msg) => {
    console.error(msg)
    const logEntry = document.createElement("div");
    logEntry.classList = 'log-entry log-error'
    const textNode = document.createTextNode(msg);
    logEntry.appendChild(textNode);
    document.getElementById("log").appendChild(logEntry);
  }
}
