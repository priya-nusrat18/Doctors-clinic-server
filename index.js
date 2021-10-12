const express = require('express')
const app = express()
const cors=require('cors')
const bodyParser = require('body-parser')
const fileupload = require('express-fileupload')
const { MongoClient , ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config();

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('doctors'))
app.use(fileupload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1msfu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



app.get('/', (req, res) => {
  res.send('Hello, from Doctors Clinic !')
})
client.connect(err => {
  const appoinmentsCollection = client.db("doctorsClinic").collection("appoinments");
  const doctorsCollection = client.db("doctorsClinic").collection("doctors");

//add appoinments
app.post('/addAppointment', (req, res) => {
  const appointment = req.body;
  console.log(appointment);
  appoinmentsCollection.insertOne(appointment)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
});

//get all appoinments
app.get('/appointments', (req, res) => {
  appoinmentsCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
})

//get appoinmentsByDate and filter by admin email
app.post('/appoinmentsByDate', (req, res) => {
  const date = req.body;
  const email = req.body.email;

  doctorsCollection.find({email: email})
  .toArray((err, doctors) => {
    const filter= {date: date.date}
    if(doctors.length === 0){
      filter.email = email;
    }

    appoinmentsCollection.find(filter)
    .toArray((err, documents) => {
      res.send(documents);
  })
})

 
});

//add o doctor and img upload 
app.post('/addADoctor' , (req,res)=>{
  const file = req.files.file
  const name = req.body.name
  const email = req.body.email
  const newImg = file.data;
  const encImg = newImg.toString('base64');

  var image = {
    contentType: file.mimetype,
    size: file.size,
    img: Buffer.from(encImg, 'base64')
};

doctorsCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })

  // console.log(name, email, image);
  // file.mv(`${__dirname}/doctors/${file.name}` , err => {
  //  if(err){
  //   console.log(err);
  //   return res.status(500).send({msg : 'failed to upload img'})
  //  }
  //  return res.send({name : file.name, path: `/${file.name}`})
  // })
})

//get all doctor 
app.get('/doctors', (req, res) => {
  doctorsCollection.find({})
      .toArray((err, documents) => {
          res.send(documents);
      })
})
 //admin access
 app.post('/isAdmin' , (req , res) =>{
  const email = req.body.email;
  doctorsCollection.find({ email: email })
  .toArray((err, doctors) => {
    res.send(doctors.length > 0)
  })
 })

  console.log("mongodb working");
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })