const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String, required: true },
  rating: { type: Number, default: 4.7 },
  coverImage: { type: String, required: true },
  htmlUrl: { type: String, required: true },
  price: { type: Number, required: true }, 
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
