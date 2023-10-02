const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([path.join(idlDir, "loris_trustpilot.json")]);

// Update accounts.
kinobi.update(
  new k.UpdateAccountsVisitor({
    domain: {
      seeds: [
        k.stringConstantSeed("domain"),
        k.stringSeed("domainName", "The domain name to review"),
      ],
    },
    review: {
      seeds: [
        k.stringConstantSeed("review"),
        k.publicKeySeed("domain", "The domain PDA"),
        k.publicKeySeed("reviewer", "The wallet reviewing the domain"),
      ],
    },
  })
);

// Update instructions.
kinobi.update(
  new k.UpdateInstructionsVisitor({
    createDomain: {
      accounts: {
        domain: {
          defaultsTo: k.pdaDefault("domain"),
        },
      },
    },
  })
);

// Set ShankAccount discriminator.
const key = (name) => ({ field: "key", value: k.vEnum("Key", name) });
kinobi.update(
  new k.SetAccountDiscriminatorFromFieldVisitor({
    domain: key("Domain"),
    review: key("Review"),
  })
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new k.RenderJavaScriptVisitor(jsDir, { prettier }));
