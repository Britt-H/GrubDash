const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res, next) {
  res.send({data: dishes});
}

function create (req, res, next) {
  const { data } = req.body;
  const { name, description, price, image_url } = data;
  const id = nextId();

  const dish = {
    id,
    name,
    description,
    price,
    image_url,
  };

  dishes.push(dish);

  res.status(201).json({ data: dish });
};

function read(req, res, next) {
  const { dish } = res.locals;
  res.send({ data: dish })
}

function update(req, res, next) {
  // Create update functionality
  //Grab dishId from route
  const { data } = req.body;
  const dishId = res.locals.dishId;
  const index = dishes.findIndex((dish) => dish.id === dishId);
  const dish = dishes[index];

  //destructure all fields from data
  const { name, description, price, image_url } = data;

  //set template for update
  if (name) {dish.name = name;}
  if (description) {dish.description = description;}
  if (price) {dish.price = price;}
  if (image_url) {dish.image_url = image_url;}

  res.json({ data: dish });
};

function destroy (req, res, next) {
  // Create destroy functionality
  const { index } = res.locals;
  dishes.splice(index, 1);
  res.sendStatus(204);
};

//middleware
function validateDataExists(req, res, next) {
  if (req.body.data) {
    next();
  } else {
    next({
      status: 400,
      message: "Please include a data object in your request body."
    })
  }
}

function createValidatorFor(field) {
  return function (req, res, next) {
    if (req.body.data[field] && req.body.data[field] !== "") {
      next();
    } else {
      next({
        status: 400,
        message: `Dish must include a ${field}`
      })
    }
  }
}

function validatePrice(req, res, next) {
  const {price} = req.body.data;
  if(price > 0 && !isNaN(price)) {
      next();
  }
  else {
      next({status: 400, message: `Dish must have a price that is an number greater than 0`})
  }
}

function validateExists(req, res, next) {
  const dishId = req.params.dishId;
  const index = dishes.findIndex((dish) => dish.id === dishId);
  if (index === -1) {
    const message = `Dish does not exist: ${dishId}`;
    return next({ status: 404, message });
  }
  res.locals.dish = dishes[index];
  res.locals.index = index;
  next();
}

function validateId(req, res, next) {
  const id = req.params.dishId;
  const dish = dishes.find((dish) => dish.id === id);
  if (!dish) {
    return next({
      status: 404,
      message: `Dish not found with id: ${id}`
    });
  }
  res.locals.dishId = id;
  res.locals.dish = dish;
  next();
}

let fields = ["name", "description", "image_url"];

module.exports = {
  list,
  create: [validateDataExists, ...fields.map(createValidatorFor), validatePrice, create],
  read: [validateExists, read],
  update: [validateExists, validateDataExists, ...fields.map(createValidatorFor), validatePrice, validateId, update],
  destroy: [validateExists, destroy],
};