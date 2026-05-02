const fs = require("fs");
const path = require("path");

const stateFile = path.resolve(__dirname, "../.antigravity-enabled");
const action = process.argv[2] || "run";

function isEnabled() {
  return fs.existsSync(stateFile);
}

function enable() {
  fs.writeFileSync(stateFile, "enabled\n", "utf8");
  console.log("antigravity enabled.");
}

function disable() {
  fs.rmSync(stateFile, { force: true });
  console.log("antigravity disabled.");
}

function status() {
  console.log(`antigravity is ${isEnabled() ? "enabled" : "disabled"}.`);
}

if (action === "on") {
  enable();
  process.exit(0);
}

if (action === "off") {
  disable();
  process.exit(0);
}

if (action === "toggle") {
  if (isEnabled()) {
    disable();
  } else {
    enable();
  }
  process.exit(0);
}

if (action === "status") {
  status();
  process.exit(0);
}

if (!isEnabled()) {
  console.log("antigravity is currently disabled. Run `npm run antigravity:on` or `npm run antigravity:toggle` to enable it.");
  process.exit(0);
}

require("antigravity");
