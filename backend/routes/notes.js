const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');
const e = require('express');

// ROUTE 1: Get all the notes for the logged in user. | GET : "/api/notes/fetchallnotes" | Login required 

router.get('/fetchallnotes', fetchuser, async (req, res) => {


    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error. Please contact admin.');
    }
});


// ROUTE 2: Add a note for the logged in user. | POST : "/api/notes/addnote" | Login required 

router.post('/addnote', fetchuser,
    [
        body('title', 'Enter a valid title.').isLength({ min: 3 }),
        body('description', 'Description must be atleast 5 characters long.').isLength({ min: 5 })
    ],
    async (req, res) => {

        // if there are errors, return bad request and errors

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(400).json({ error: errors.array() });
        }

        try {

            const { title, description, tag } = req.body;

            const note = new Notes({
                title, description, tag, user: req.user.id
            });

            const savedNote = await note.save();

            res.json(savedNote);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Internal server error. Please contact admin.');
        }
    });

// ROUTE 3: Update an existing note for the logged in user. | POST : "/api/notes/updatenote" | Login required 

router.put('/updatenote/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body;

    try {

        let newNote = {};

        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        let note = await Notes.findById(req.params.id);

        if (!note) { return res.status(404).send("Not Found") };

        if ( note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

        res.json({ note });

    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error. Please contact admin.');
    }
});


// ROUTE 4: Delete an existing note for the logged in user. | POST : "/api/notes/deletenote" | Login required 

router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {

        let note = await Notes.findById(req.params.id);

        if (!note) { return res.status(404).send("Not Found") };

        if ( note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        note = await Notes.findByIdAndDelete(req.params.id);

        res.json({ 'success': 'Note has been deleted successfully...!', note: note });

    }
    catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error. Please contact admin.');
    }
});

module.exports = router;