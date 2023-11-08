const PORT = process.env.PORT || 3001; //set the server port to the envirioment variable or 3001 if not defined 
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express(); // creates an express application

const allNotes = require('./db/db.json'); // loads notes from existin db.json file 

app.use(express.urlencoded({ extended: true })); // Middleware for parsul URL-encoded data
app.use(express.json()); // Middleware for parsing JSON data 
app.use(express.static('public')); // Server static files from 'public directory


// API endpoint to get all notes (excluding the first element)
app.get('/api/notes', (req, res) => {
    res.json(allNotes.slice(1));
});


// serve the default HTML file for the root url
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});


// serve the notes.html file for the '/notes' url path
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});


// Catch-all route to serve the default HTML file for any other URL
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});


// Function to create a new note and update the db.json file 
function createNewNote(body, notesArray) {
    const newNote = body;
    if (!Array.isArray(notesArray))
        notesArray = [];
    
    if (notesArray.length === 0)
        notesArray.push(0);

    body.id = notesArray[0];
    notesArray[0]++;


    //write the updated notes array to the db.json file
    notesArray.push(newNote);
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(notesArray, null, 2)
    );
    return newNote;
}


// API endpoint to create a new note
app.post('/api/notes', (req, res) => {
    const newNote = createNewNote(req.body, allNotes);
    res.json(newNote);
});


// function to delete a note by id and update the db.json file
function deleteNote(id, notesArray) {
    for (let i = 0; i < notesArray.length; i++) {
        let note = notesArray[i];

        if (note.id == id) {
            notesArray.splice(i, 1);


            //writes the updated notes array to the db.json file 
            fs.writeFileSync(
                path.join(__dirname, './db/db.json'),
                JSON.stringify(notesArray, null, 2)
            );

            break;
        }
    }
}

// API endpoint to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
    deleteNote(req.params.id, allNotes);
    res.json(true);
});

//starts the Express server.

try {
    app.listen(PORT, () => {
        console.log(`API server now on port http://localhost:${PORT}`);
    });
} catch (error) {
    console.error("Server crashed with an error:", error);
}