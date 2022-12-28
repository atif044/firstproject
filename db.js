const mongoose = require('mongoose')
const express=require('express')
const app=express()
const mongoURI = "mongodb+srv://firstprojectcyclic:helloitsme@cluster0.qqxxm47.mongodb.net/test"

const connectToMongo = () => {
        mongoose.connect(mongoURI,{config:{ autoIndex: false }}, (err) =>{
                
                if(err)
                {
                        console.log(err);
               }
                 else{
                console.log("successfully connected to mongo")
               }
        }) 
        }
module.exports = connectToMongo;