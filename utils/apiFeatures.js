class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Search filtering
  filter() {
    const queryObj = { ...this.queryString }; // Get all the query object fields
    const excludedFields = ['page', 'sort', 'limit', 'fields']; // Creat fields that should be excluded from the query string
    excludedFields.forEach((el) => delete queryObj[el]); // Delete the excluded fields from the query object

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj); // Convert the query sting to JSON string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // Add the $ sign to the search query (to fit the mongoDB syntax)

    this.query = this.query.find(JSON.parse(queryStr)); // Use the 'find()' method and parse the query string back to JavaScript string

    return this;
  }

  //sorting
  sort() {
    if (this.queryString.sort) {
      // If the sort parameter appears in the query
      const sortBy = this.queryString.sort.split(',').join(' '); // We need to slit the query and then join it with a space
      this.query = this.query.sort(sortBy); // Apply the 'sort()' method with the sort query field content
    } else {
      this.query = this.query.sort('name'); // Default sort by name in an ascending order
    }

    return this;
  }

  // Field limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // Pagination
  paginate() {
    // We get the page from the query string and multiply it by one so it'll be converted to a number, then we set a default value of 1.
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // The formula for determining how many documents to skip for the 'skip()' method

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
