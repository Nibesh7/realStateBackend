import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
    const {username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        })
        res.status(201).json({message: 'User Created Successfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: 'Failed to create user'})

    }
   
}
export const login = async (req, res) => {
    const {username, password } = req.body;

    try {
        // check if user exist
        const user = await prisma.user.findUnique({where: {username }})
        if(!user)  res.status(401).json({message: 'Invalid credentials'})
        
        // check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password); 
        if(!isPasswordValid)  res.status(401).json({message: 'Invalid credentials'})

        // generate cookie token and send to user
        // res.setHeader("Set-Cookie", "test=" + "myvalue").json("success")
        const age = 1000 * 60 * 60 * 24 *7;

        const token = jwt.sign({
            id: user.id,
            isAdmin: true

        },process.env.JWT_SECRET_KEY, {expiresIn: age})

        const { password: userPassword, ...userinfo} = user
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: age
        }).status(200).json(userinfo)

    } catch (error) {
        res.status(201).json({message: 'Failed to login'})
        
    }
    
}
export const logout = (req, res) => {   
    res.clearCookie("token").status(200).json({message: 'Logout Successful'})    
}