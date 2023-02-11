import express, { Application } from 'express';
import path, { dirname } from 'path';
import { set, connect, ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import morgan from 'morgan';
import multer, { MulterError } from 'multer';
import cors, { CorsOptions } from 'cors';

const fileLimit: number = 4194304;
const multerOptions: multer.Options = {
  dest: './storage',
  // if file is of a supported mime type
  fileFilter(req, file, callback) {
    enum SupportedMimeTypes {
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    }
    // returns true if the value is of the supported mime type
    if (Object.values(SupportedMimeTypes).includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('FILE_NOT_SUPPORTED'));
    }
  },
  limits: { fileSize: fileLimit },
};
const corsOptions: CorsOptions = {
  origin: '*',
};
const upload = multer(multerOptions).single('image');
const app: Application = express();
const dbURI: string = 'mongodb://localhost:27017';
const PORT: number = Number(process.env.PORT) || 3000;
const options: ConnectOptions = {
  dbName: 'LearnMongo',
  family: 4, // Use IPv4, skip trying IPv6
};

set('strictQuery', true);
connect(dbURI, options).then(() => {
  console.log('connection successful to database on PORT 27017');
  app.listen(PORT, async () => {
    console.log('connected to server on http://localhost:' + PORT);
  });
});

// setting middlewares
app.use(morgan('short'));
app.use(cors(corsOptions));
app.get('/', (request, response) => {
  response.sendFile(path.resolve(__dirname, './view/index.html'));
});
app.post('/upload/single', (request, response) => {
  upload(request, response, (err) => {
    if (err instanceof MulterError) {
      console.log(err.code);
      response.json(err.code);
    } else if (err) {
      // handles custom errors
      console.log(err.message);
      response.json(err.message);
    } else response.json('SUCCESSFUL');
  });
});
