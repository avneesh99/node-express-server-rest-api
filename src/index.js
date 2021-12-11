import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import models from './models';
import routes from './routes';
const akto_log = require("express-api-logging")

const app = express();

// * Application-Level Middleware * //

// Third-Party Middleware

app.use(cors());

// Built-In Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Middleware

app.use(akto_log.init("akto.api.logs","1000000", 2))

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
const broker_id = process.env.AKTO_CONNECT_IP
let producer = akto_log.getKafkaProducer('my-app', [broker_id])

producer.connect().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}!`);
  });
  app.locals.akto_kafka_producer = producer;
});

