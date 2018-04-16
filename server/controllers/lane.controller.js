import Lane from '../models/lane';
import Note from '../models/note';
import uuid from 'uuid';

export function getSomething(req, res) {
  return res.status(200).end();
}

export function getLanes(req, res) {
  Lane.find().exec((err, lanes) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ lanes });
  });
}

export function addLane(req, res) {
  if (!req.body.name) {
    res.status(403).end();
    return;
  }
  const newLane = new Lane(req.body);
  newLane.notes = [];
  newLane.id = uuid();
  newLane.editing = false;
  newLane.save((err, saved) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(saved);
  });
}

export function deleteLane(req, res) {
  Lane.findOne({ id: req.params.laneId }).exec((err, lane) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    let error;
    lane.notes.forEach((note) => {
      if(!error) {
        note.remove((err) => {
          error = err;
        });
      }
    });
    if (error) {
      res.status(500).send(error);
      return;
    }
    lane.remove((err) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.status(200).end();
    });
  });
}

export function editLane(req, res) {
  const { lane } = req.body;
  if (!lane || !lane.name) {
    res.status(403).end();
    return;
  }
  Lane.findOneAndUpdate({ id: req.params.laneId }, { $set: { name: lane.name } }, { new: true }).exec((err, editedLane) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(editedLane);
  });
}
