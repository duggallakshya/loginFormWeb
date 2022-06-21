const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/"+process.env.DB_NAME,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`connection successful`);
}).catch((e) => {
    console.log(`no connection `);
})