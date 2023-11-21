import jwt from "jsonwebtoken";
import express from 'express';
import { authenticateJwt, SECRET } from "../middleware/";
import { User } from "../db";
//import { signupInput } from "@100xdevs/common"
import { z } from "zod";
let titleInputProps = z.object({

    username:z.string().min(1),
    password:z.string().min(1).max(10)
})

const router = express.Router();
interface MessageType{
  messgae:string;
  token:string|undefined;

}
router.post('/signup', async (req:any, res:any) => {
    let parsedInput = titleInputProps.safeParse(req.body)
    if (!parsedInput.success) {
      return res.status(403).json({
        msg: "error"
      });
    }
    const username = parsedInput.data.username;
    const password = parsedInput.data.password ;
    

    
    const user = await User.findOne({ username:username });
    if (user) {
      res.status(403).json({ message: 'User already exists' });
    } else {
      const newUser = new User({ username, password });
      await newUser.save();
      const token= jwt.sign({ id: newUser._id }, SECRET, { expiresIn: '1h' });
    }
      let input:MessageType={ message: 'User created successfully', token}
      res.json({ message: 'User created successfully', token});
    }
  });
  
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });
      res.json({ message: 'Logged in successfully', token });
    } else {
      res.status(403).json({ message: 'Invalid username or password' });
    }
  });

    router.get('/me', authenticateJwt, async (req, res) => {
      const userId = req.headers["userId"];
      const user = await User.findOne({ _id: userId });
      if (user) {
        res.json({ username: user.username });
      } else {
        res.status(403).json({ message: 'User not logged in' });
      }
    });

  export default router
