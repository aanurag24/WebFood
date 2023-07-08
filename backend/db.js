const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://aanuraganand2410:test123@food.qemidnn.mongodb.net/gofoodmern?retryWrites=true&w=majority';

mongoose.set('strictQuery', false);

module.exports = () => {
  return mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
      const foodCollection = mongoose.connection.db.collection('food_items');
      const categoryCollection = mongoose.connection.db.collection('Categories');
      const dataPromise = foodCollection.find({}).toArray();
      const catDataPromise = categoryCollection.find({}).toArray();
      return Promise.all([dataPromise, catDataPromise]);
    })
    .then(([data, catData]) => {
      console.log('Data retrieved from MongoDB');
      return { data, catData };
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err);
      throw err;
    });
};
