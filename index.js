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
  id: '76670400dc4f22722278',
  key: '23f221c25c8f7b67',
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
});

app.get('/api/off', (req, res) => {
  connect(20, false);
});

app.get('/api/white', (req, res) => {
  connect(21, 'white');
});

app.get('/api/colour', (req, res) => {
  connect(21, 'colour');
});

app.get('/api/police', async (req, res) => {
  await device.find();
  await device.connect();
  for (let i = 0; i < 15; i++) {
    console.log(`Loop ${i}`);
    await device.set({ dps: 24, set: colors.red });
    await delay(900);
    await device.set({ dps: 24, set: colors.blue });
    await delay(900);
  }
  await device.disconnect();
});

app.listen(port);
