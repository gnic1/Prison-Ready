// metro.config.js — extends Expo's default Metro config.
// Required by expo-doctor; without this, EAS warns about a "custom" Metro config.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
