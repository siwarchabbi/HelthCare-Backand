require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require("http");
mongoose.set('strictQuery', false);

const path = require('path');

connectDb();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());


app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/prestataires', require('./routes/prestataireRoutes'))
app.use('/api/patients', require('./routes/patientRoutes'))
app.use('/api/remboursements', require('./routes/RemboursementRoutes'));
app.use(errorHandler);
 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}
);


