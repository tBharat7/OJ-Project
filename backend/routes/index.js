const express = require('express');
const router = express.Router();

const models = {
  users: require('../model-defs/User'),
  problems: require('../model-defs/Problem'),
  submissions: require('../model-defs/Submission'),
  competitions: require('../model-defs/Competition'),
  leaderboards: require('../model-defs/Leaderboard')
};

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function crudRoutes(resource, Model) {
  router.get(`/${resource}`, asyncHandler(async (req, res) => {
    const data = await Model.find().lean();
    res.json(data);
  }));
  
  router.get(`/${resource}/:id`, asyncHandler(async (req, res) => {
    const data = await Model.findById(req.params.id).lean();
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  }));
  
  router.post(`/${resource}`, asyncHandler(async (req, res) => {
    const data = await Model.create(req.body);
    res.status(201).json(data);
  }));
  
  router.put(`/${resource}/:id`, asyncHandler(async (req, res) => {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, lean: true });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  }));
  
  router.delete(`/${resource}/:id`, asyncHandler(async (req, res) => {
    const data = await Model.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  }));
}

Object.entries(models).forEach(([resource, Model]) => crudRoutes(resource, Model));

module.exports = router;