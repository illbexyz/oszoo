import express from 'express';
const router = express.Router();

// GET home page
router.get('/', (req, res) => {
  res.render('index', { title: 'OSZoo' });
});

export default router;
