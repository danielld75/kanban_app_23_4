import Note from '../models/note';
import Lane from '../models/lane';
import uuid from 'uuid';

export function getSomething(req, res) {
  return res.status(200).end();
}

export function addNote(req, res) {
  const { note, laneId } = req.body;
  if (!note || !note.task || !laneId) {
    res.status(400).end();
    return;
  }
  const newNote = new Note({
    task: note.task,
  });
  newNote.id = uuid();
  newNote.laneId = laneId;
  newNote.save((err, saved) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    Lane.findOne({ id: laneId })
      .then(lane => {
        lane.notes.push(saved);
        return lane.save();
      })
      .then(() => {
        res.json(saved);
      });
  });
}

export function deleteNote(req, res) {
  Note.findOneAndRemove({ id: req.params.noteId }).exec((err, note) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    Lane.findOne({ id: note.laneId })
      .then(lane => {
        const notesArray = lane.notes.filter(oneNote => oneNote.id !== req.params.noteId);
        lane.update({ notes: notesArray }, (error) => {
          if (error) {
            res.status(500).send(error);
            return;
          }
          res.status(200).end();
        });
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });
}

export function editNote(req, res) {
  if (!req.body.task) {
    res.status(403).end();
    return;
  }
  Note.findOneAndUpdate({ id: req.params.noteId }, { $set: { task: req.body.task } }).exec((err, note) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(note);
  });
}
