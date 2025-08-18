// utils/runPython.js
const { spawn } = require("child_process");

const runPython = (pyExecPath, scriptPath, args = []) => {
  return new Promise((resolve, reject) => {
    const python = spawn(pyExecPath, [scriptPath, ...args]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Python exited with code ${code}: ${errorOutput}`));
      }
      resolve(output.trim());
    });
  });
};

module.exports = runPython;
