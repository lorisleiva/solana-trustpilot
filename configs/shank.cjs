const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");

generateIdl({
  generator: "shank",
  programName: "loris_trustpilot",
  programId: "6BvjJHhheqrQpNFkYKAMtd1B7FPTBpxp1QncnwsH3mE7",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "loris-trustpilot"),
});
