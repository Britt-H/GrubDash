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
  const dish = res.locals.dish
  const { data: { name, description, price, image_url } = {} } = req.body

  dish.name = name;
  dish.description = description;
  dish.price = price
  dish.image_url = image_url;

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

//validates field for CREATE/UPDATE
function fieldValidator(field) {
  return function (req, res, next) {
    if (req.body.data[field]) {
      if(field === 'price' && (req.body.data[field] < 0 || typeof req.body.data[field] !== 'number')){
          next({
              status: 400,
              message: `Dish must indlude a ${field}`
          })
      }else{
          next();            
      }
    } else {
      next({
        status: 400,
        message: `Dish must indlude a ${field}`
      })
    }
  }
}

function validateUpdateId(req, res, next){
  const dishId = res.locals.dish.id
  const{ data: { name, description, price, image_url, id } = {} } = req.body;

  if(!id || dishId === id){
      next()
  } else {
      next({
          status: 400,
          message: `id: ${id} does not match`
        })
  }
}


//validation middleware(validates id in route) (READ/UPDATE)
function validateDishExists(req, res, next) {
  let { dishId } = req.params;
  dishId = dishId;
  let index = dishes.findIndex(dish => dish.id === req.params.dishId);
  if (index > -1) {
    let dish = dishes[index];
    // save the dinosaur that we found for future use
    res.locals.dish = dish;
    res.locals.index = index;
    next();
  } else {
    next({
      status: 404,
      message: `Could not find dish with id ${dishId}`
    })
  }
}


function deleteDishExists(req, res, next) {
  let { dishId } = req.params;
  dishId = dishId;
  let index = dishes.findIndex(dish => dish.id === req.params.dishId);
  if (index > -1) {
    let dish = dishes[index];
    // save the dinosaur that we found for future use
    res.locals.dish = dish;
    res.locals.index = index;
    next({status: 405});
  } else {
    next({
      status: 405,
      message: `Could not find dish with id ${dishId}`
    })
  }
}

let fields = ["name", "description", "price", "image_url"];

module.exports = {
  list,
  create: [
    validateDataExists, 
    ...fields.map(fieldValidator), 
    create
  ],
  read: [
    validateDishExists, 
    read
  ],
  update: [
    validateDishExists, 
    validateUpdateId, 
    ...fields.map(fieldValidator),  
    update
  ],
  destroy: [
    deleteDishExists, 
    destroy],
};