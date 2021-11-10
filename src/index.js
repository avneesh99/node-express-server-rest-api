import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import models from './models';
import routes from './routes';
const akto_log = require("express-api-logging")
const { Kafka } = require('kafkajs')

const app = express();

// * Application-Level Middleware * //

// Third-Party Middleware

app.use(cors());

// Built-In Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Middleware

app.use(akto_log.init(['172.20.0.3:9092'],'akto.api.logs'))

app.use((req, res, next) => {
  req.context = {
    models,
    me: models.users[1],
  };
  next();
});

// * Routes * //

app.use('/session', routes.session);
app.use('/users', routes.user);
app.use('/messages', routes.message);

// * Start * //
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['172.26.0.3:9092'],
})
let producer = kafka.producer()
producer.connect().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}!`);
  });
  app.locals.producer = producer;
});

