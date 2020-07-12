require('dotenv').config();
const Tuya = require('tuyapi');
var express = require('express');
var path = require('path');
const chalk = require('chalk');
const colors = require('./colors');
const delay = require('delay');
const { allowedNodeEnvironmentFlags } = require('process');

const app = express();

const device = new Tuya({
  id: process.env.DEVICE_ID,
  key: process.env.DEVICE_KEY,
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.use(express.static('views'));

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
  return res.status(200).send('Success');
});

app.get('/api/off', (req, res) => {
  connect(20, false);
  return res.status(200).send('Success');
});

app.get('/api/white', (req, res) => {
  connect(21, 'white');
  return res.status(200).send('Success');
});

app.get('/api/colour', (req, res) => {
  connect(21, 'colour');
  return res.status(200).send('Success');
});

app.get('/api/police', async (req, res) => {
  await device.find();
  await device.connect();
  res.status(200).send('Success');
  await device.set({ dps: 21, set: 'colour' });
  for (let i = 0; i < 15; i++) {
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
  return res.status(200).send('Success');
});

app.get('/api/lower-white', async (req, res) => {
  await device.find();
  await device.connect();
  const brightness = await device.get({ dps: 22 });
  let bright = brightness - 100;
  if (bright > 99) {
    await device.set({ dps: 22, set: bright });
  } else if (bright < 99) {
    await device.set({ dps: 22, set: 10 });
  }
  return res.status(200).send('Success');
});

app.get('/api/up-white', async (req, res) => {
  await device.find();
  await device.connect();
  const brightness = await device.get({ dps: 22 });
  let bright = brightness + 100;

  // Thats some real lazy stuff
  if (bright === 910) {
    bright = 1000;
  }

  if (bright < 1001) {
    await device.set({ dps: 22, set: bright });
  }
  return res.status(200).status(200).send('Success');
});

app.get('/api/night', (req, res) => {
  connect(21, 'colour');
  connect(24, colors.night);
  return res.status(200).send('Success');
});

app.get('/api/rain', async (req, res) => {
  res.status(200).send('Success');
  await device.find();
  await device.connect();
  await device.set({ dps: 21, set: 'colour' });
  for (let i = 0; i < 15; i++) {
    await device.set({ dps: 24, set: colors.teal });
    await delay(6500);
    await device.set({ dps: 24, set: colors.tealMid });
    await delay(3300);
  }
  await device.disconnect();
});

app.listen(process.env.PORT || 3010);
