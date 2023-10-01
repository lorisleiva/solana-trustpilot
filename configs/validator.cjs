const path = require("path");

const programDir = path.join(__dirname, "..", "programs");

function getProgram(programBinary) {
  return path.join(programDir, ".bin", programBinary);
}

module.exports = {
  validator: {
    commitment: "processed",
    programs: [
      {
        label: "Loris Trustpilot",
        programId: "6BvjJHhheqrQpNFkYKAMtd1B7FPTBpxp1QncnwsH3mE7",
        deployPath: getProgram("loris_trustpilot.so"),
      },
    ],
  },
};
