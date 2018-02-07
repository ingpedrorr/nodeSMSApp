const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

// Init Nexmo
const nexmo = new Nexmo({
  apiKey: '__YOURAPIKEY_HERE__',
  apiSecret: '__YOURAPISECRET_HERE__'
}, { debug: true });

// Init app
const app = express();

// Template engine setup
app.set( 'view engine', 'html' );
app.engine( 'html', ejs.renderFile );

// Public folder setup
app.use(express.static( __dirname + '/public' ));

// Body parser middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index routes
app.get('/', (req, res) => {
  res.render('index');
});

// Catch form submitted
app.post('/', (req, res) => {
  const number = req.body.number;
  const text = req.body.text;

  nexmo.message.sendSms(
    '____VURTUALNUMBER_HERE___', number, text, { type: 'unicode' },
    (err, responseData) => {
      if(err) {
        console.log(err);
      } else {
        console.dir(responseData);
        // Get data from response
        const data = {
          id: responseData.messages[0]['message-id'],
          number: responseData.messages[0]['to']
        }

        // Emit to the client
        io.emit('smsStatus', data);
      }
    }
  );
});

// Define PORT
const PORT = 3000;

// Start server
const server = app.listen(PORT, () => console.log(`Server started on port ${ PORT }`));

// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
})
