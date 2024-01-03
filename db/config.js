const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://pratyushsharma1404:pratyush@dbetms.5zp5afe.mongodb.net/db_etms?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindandModify: false
}).then(() => {
    console.log('connection successful');
}).catch((err) => console.log(err));