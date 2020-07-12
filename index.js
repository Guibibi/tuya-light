require('dotenv').config();
const Tuya = require('tuyapi');
var rnd = require('id-16');
var express = require('express');
var path = require('path');
const chalk = require('chalk');
const colors = require('./colors');
const delay = require('delay');

const app = express();
const port = 3009;

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.use(express.static('views'));

const device = new Tuya({
  id: process.env.DEVICE_ID,
  key: process.env.DEVICE_KEY,
});

function connect(dps, value) {
  device.find().then(() => {
    device.connect().then(() => {
      device.set({ dps: dps, set: value }).then(() => {
        device.disconnect();
      });
    });
  });
}

device.on('connected', (data) => {
  console.log(chalk.green('Device has connected!'));
  console.log(data);
});

device.on('disconnected', () => {
  console.log('Disconnected from device');
});

device.on('error', (error) => {
  console.log('Error!', error);
});

device.on('data', (data) => {
  console.log(data);
});

app.get('/api/on', (req, res) => {
  connect(20, true);
  return res.send('Success');
});

app.get('/api/off', (req, res) => {
  connect(20, false);
  return res.send('Success');
});

app.get('/api/white', (req, res) => {
  connect(21, 'white');
  return res.send('Success');
});

app.get('/api/colour', (req, res) => {
  connect(21, 'colour');
  return res.send('Success');
});

app.get('/api/police', async (req, res) => {
  res.send('Success');
  await device.find();
  await device.connect();
  await device.set({ dps: 21, set: 'colour' });
  for (let i = 0; i < 15; i++) {
    console.log(`Loop ${i}`);
    await device.set({ dps: 24, set: colors.red });
    await delay(900);
    await device.set({ dps: 24, set: colors.blue });
    await delay(900);
  }
  await device.disconnect();
});

app.get('/api/status', async (req, res) => {
  await device.find();
  await device.connect();
  await device.get();
  await device.disconnect();
  return res.send('Success');
});

app.listen(port);
