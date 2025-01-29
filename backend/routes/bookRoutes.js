const express = require('express');
const {
  getBooks,
  getBookById,
  addBook,
  searchBooks,
  getRecommendations,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

const router = express.Router();

// Define routes
router.get('/recommendations', protect, getRecommendations);
router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);
router.post('/', protect, roleMiddleware(['Admin']), addBook);
router.put('/:id', protect, roleMiddleware(['Admin']), updateBook);
router.delete('/:id', protect, roleMiddleware(['Admin']), deleteBook);

module.exports = router;