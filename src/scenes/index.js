// File Path: src/scenes/index.js

const { Scenes } = require('telegraf');

// Import all individual scenes
const receiptWizard = require('./receipt.scene');
const packageWizard = require('./package.scene');
const broadcastWizard = require('./broadcast.scene');

// Register them in a single Stage
const stage = new Scenes.Stage([
    receiptWizard,
    packageWizard,
    broadcastWizard
]);

module.exports = { stage };