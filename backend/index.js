import express from 'express';
import { PORT, mongoDBURL } from './config.js';
import mongoose from 'mongoose';
import servicemenRouter from "./routes/servicemen.js"; 
import bookingRouter from "./routes/booking.js"
import emailRoute from "./routes/emailRoute.js"
import userRoute from "./routes/userRoute.js"
import cors from 'cors';
import connectMongoDb from './connection.js';
import complainRoute from "./routes/complainRoute.js"
import ServiceMan from './models/servicemen.js';
import Booking from './models/booking.js';
// import twilioRouter from "./routes/servicemen.js"
import axios from "axios";


const app = express();

// Middleware
app.use(express.json());
// app.use(cors({
  //   origin: "http://localhost:5173",
  //   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type'],
// }));

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from this origin
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// Routes
app.get('/', (req, res) => {
  console.log(req);
  return res.status(200).send('Welcome To MERN Stack Tutorial');
});

app.use('/service', servicemenRouter);
app.use("/api", userRoute);
app.use("/booked", bookingRouter);
app.use("/mailed", emailRoute);
app.use("/complain", complainRoute)




app.get('/get-addressofservicemen/:id', async (req, res) => {
  try {
    const doc = await ServiceMan.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const address_staff = doc.address;
    // Send the address field as a response
    res.json({ address: address_staff});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/get-addressofbooking/:id', async (req, res) => {
  try {
    const doc = await Booking.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const address_booking = doc.address;
    // Send the address field as a response
    res.json({ address: address_booking });

    // Calculate distance
    const apiKey = process.env.GOOGLE_API_KEY;
    const deliveryAddress = address_booking;
    const vendorAddress = address_staff;
    const apiUrl = `https://maps.google.com/maps/api/distancematrix/json?units=imperial&origins=${vendorAddress}&destinations=${deliveryAddress}&key=${apiKey}`;
    const response = await axios.get(apiUrl);
    console.log(response.data);
    console.log(response.data.rows[0].elements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// async function calculateDistance(){
//   try {
//     const apiKey = process.env.GOOGLE_API_KEY;
//     const deliveryAddress = address_booking
//     const vendorAddress = address_staff
//     const appUrl = "https://maps.google.com/maps/api/distancematrix/json?units=imperial&origins=${vendorAddress}&destinations=${deliveryAddress}&key=${apiKey}";
//     const response = await axios.get(apiUrl);
//     console.log(response.data);
//     console.log(response.data.rows[0].elements);
//   } catch (error) {
//     console.log(error);
//   }
// }




// app.use("/sms", twilioRouter)

// MongoDB Connection
// mongoose.connect(mongoDBURL).then(() => {
//   console.log("MongoDB connected!");
// }).catch(err => {
//   console.error("MongoDB connection error:", err);
//   process.exit(1); // Exit the process if MongoDB connection fails
// });

connectMongoDb("mongodb://127.0.0.1:27017/serviceuser").then(()=>{
  console.log("Mongodb connected!")
}).catch(err=>{
  console.log("MongoDB connection error: ", err);
  process.exit(1);
})

// Error Handling Middleware
app.use((err, req, res, next) => {
  // console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
});
