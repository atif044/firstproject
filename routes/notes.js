const express=require('express')
const router=express.Router()
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');
const fetchuser=require('../middleware/fetchuser')

/////////////////////////////CRUD////////////////////////////

///////////////////////////////CREATE//////////////////////////////////
//ROUTE 1: CREATING A NOTE USING POST :/api/notes/createnote   //login required 
router.post('/createnote',[
    body("title", 'Must be of length 3 or more').isLength({ min: 3 }),
    body("description", 'Descrption Minimum length:5').isLength({ min: 5 }),

],fetchuser,async(req,res)=>{
    
    const errors = validationResult(req)
    //check for any errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {

        const {title,description,tag}=req.body;//destructuring 

        const errors = validationResult(req)//to valdate the title,descripton and tag
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() })}
    else{
        //const notes=await new Notes.find({user:req.user.id});
        //creating a new note if logged in
        const notes= await Notes.create(
            {
                user:req.user.id,
                title:req.body.title,
                description:req.body.description,
                tag:req.body.tag
            }
        )
        res.json(notes)
    }
    }
    
     catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error!!");
    }

    
})

////////////////////////////////////////READ/////////////////////////////////////

//route 2: reading all notes of a user using GET /api/notes/getnotes  login required
router.get('/getnotes',fetchuser,async(req,res)=>{
    try {
        const notes=await Notes.find({user:req.user.id});
        res.send(notes);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error!!");

    }

})


////////////////////////////////////////UPDATE//////////////////////////////////////////
//route 3 to update an existing note using PUT api/notes/updatenote/:id  login required


router.put('/updatenote/:id',[
    body("title", 'Must be of length 3 or more').isLength({ min: 3 }),
    body("description", 'Descrption Minimum length:5').isLength({ min: 5 }),

],fetchuser,async(req,res)=>{
    const errors = validationResult(req)
    //check for any errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
      const {title,description,tag}=req.body;
    
      const newData={};
      if(title){newData.title=title}
      if(description){newData.description=description}
      if(tag){newData.tag=tag}

       let note= await Notes.findById(req.params.id);
       if(!note)
       {
        return res.status(404).send("NOT FOUND");
       }
       if(note.user.toString() !== req.user.id)
       {
        
          return res.status(401).send("Access denied!");
       }
       note=await Notes.findByIdAndUpdate(req.params.id,{$set:newData},{new:true});
       res.json(note);
  } catch (error) {
    console.error(error.message);
        res.status(500).send("Internal Server Error");
  }
})

///////////////////////////////DELETE//////////////////////////////////////////
//route 4 to DELETE an existing note using DELETE api/notes/deletenote/:id  login required
router.delete('/deletenote/:id',fetchuser,async(req,res)=>{
    try {
      const {title,description,tag}=req.body;
       let note= await Notes.findById(req.params.id);
       if(!note)
       {
        return res.status(404).send("NOT FOUND");
       }
       if(note.user.toString() !== req.user.id)
       {
        
          return res.status(401).send("Access denied!");
       }
       note=await Notes.findByIdAndDelete(req.params.id);
       res.json({"Success":"Note has been deleted",note:note});
  } catch (error) {
    console.error(error.message);
        res.status(500).send("Internal Server Error");
  }
})








module.exports=router
