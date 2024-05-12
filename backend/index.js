

const { default: mongoose } = require("mongoose");
require('dotenv').config()
const User = require("./user.model");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Conversation = require("./conversation.model");
const Message = require("./message.model");

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});




app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input data
  if (!name || !email || !password) {
    return res.status(400).json({ status: false, message: "All fields are required" });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ status: false, message: "Email already exists" });
    }


    // Create new user
    const user = new User({ name, email, password });
    const result = await user.save();

    // Send response
    if (result) {
      res.status(201).json({ status: true, message: "User registered successfully", user: result });
    } else {
      res.status(500).json({ status: false, message: "Failed to register user" });
    }
  } catch (error) {
    // Handle errors
    res.status(500).json({ status: false, message: error.message });
  }
});



app.post("/login", async (req, res) => {
  let { email, password } = req.body

  try {
    let result = await User.findOne({ email: email, password: password });
    if (result) {
      res.json({ status: true, user: result })
    }
    else {
      res.json({ status: false, message: "not exist" })
    }

  } catch (error) {
    res.json({ status: false, message: error.errmsg })
  }

})
app.post("/getChat", async (req, res) => {
  let { id } = req.body

  try {
    let result = await Message.find({ conversation: id }, { message: 1, _id: 0, sender: 1, time: 1 });
    if (result) {
      res.json({ status: true, chat: result })
    }
    else {
      res.json({ status: false, message: "not exist" })
    }

  } catch (error) {
    res.json({ status: false, message: error.errmsg })
  }

})

app.post("/getPerson", async (req, res) => {
  const { id } = req.body;

  try {
    const result = await Conversation.findById(id).populate('person1').populate('person2');

    if (result) {
      res.json({ status: true, conversation: result });
    } else {
      res.json({ status: false, message: "Conversation not found" });
    }

  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }

})

app.post("/getUser", async (req, res) => {
  const { id } = req.body;
  try {

    const conversations = await Conversation.find({ $or: [{ person1: id }, { person2: id }] })
      .populate('person1', 'name')
      .populate('person2', 'name')
      .select('_id');

    res.json({ status: true, chat: conversations });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});


app.post("/changeStatus", async (req, res) => {
  const { id, status } = req.body;
  try {
    let user = await User.findByIdAndUpdate(id, { $set: { isActive: status } }, { new: true });

    if (user) {
      res.json({ status: true, user: user });
    } else {
      res.json({ status: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});


app.post("/search", async (req, res) => {
  let { email } = req.body
  try {
    let result = await User.findOne({ email: email });
    console.log(result)
    if (result) {
      res.json({ status: true, user: result })
    }
    else {
      res.json({ status: false, message: "not exist" })
    }
  } catch (error) {
    console.log(error)
    res.json({ status: false, message: error.errmsg })
  }
})

app.post("/conversation", async (req, res) => {
  let { person1, person2 } = req.body
  try {
    console.log(person1, person2)
    let con = new Conversation({ person1: person1, person2, person1 });
    let result = await con.save();
    console.log(person1, person2)
    if (result) {
      res.json({ status: true, con: con })
    }
    else {
      res.json({ status: false, message: "not exist" })
    }
  } catch (error) {
    console.log(error)
    res.json({ status: false, message: error.errmsg })
  }
})

io.on("connection", (socket) => {

  console.log(`a user connected ${socket.id}`);
  socket.on("send_message", async (data) => {
    console.log(data)
    try {
      if (data.nextSender) {
        let message = new Message({ message: data.message, sender: data.sender, conversation: data.roomid })
        let res = await message.save()
        if (res)
          socket.broadcast.emit("receive_message", message);
        

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = data.message;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let message1 = new Message({ message: text, sender: data.nextSender, conversation: data.roomid })
        let res1 = await message1.save()
        if (res1)
          io.emit("receive_message", message1);
        

      }
      else {
        let message = new Message({ message: data.message, sender: data.sender, conversation: data.roomid })
        let res = await message.save()
        if (res)
          socket.broadcast.emit("receive_message", message);
       
      }
    } catch (error) {
      console.log(error)
    }

  });
});


mongoose.connect(process.env.MONGO_URL).then(() => {
  server.listen(2000, () => {
    console.log("listening on *:2000");
  });
})


