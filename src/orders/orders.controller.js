const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next) {
    res.json({ data: orders });
  }
  
  function create(req, res, next) {
    const { data } = req.body
    const { deliverTo, mobileNumber, status, dishes = {} } = data
    const id = nextId();
    const order = {
      id,
      deliverTo,
      mobileNumber,
      status,
      dishes,
    };

    orders.push(order);
    
    res.status(201).json({ data: order });
  }
  
  function read(req, res, next) {
    const { order } = res.locals
    res.json({ data: order });
  }
  
  function update(req, res) {
    const { data } = req.body
    const orderId = res.locals.orderId
    const index = orders.findIndex((order) => order.id === orderId)
    const order = orders[index]

    //destructure all fields from data
    const { deliverTo, mobileNumber, status, dishes = [] } = data

    if(deliverTo) {order.deliverTo = deliverTo}
    if(mobileNumber) {order.mobileNumber = mobileNumber}
    if(status) {
        order.status = status
    } else {
        next ({
            status: 400,
            message: `Status must be defined`
        })
    }
    if(dishes.length > 0) {
        order.dishes = dishes
    } else {
        next({
            status: 400,
            message: "Must have at least one dish"
        })
    }
    res.json({ data: order });
  }
  
  function destroy(req, res, next) {
    const { index } = res.locals
    orders.splice(index, 1);
    res.sendStatus(204);
  }

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
          message: `Order must include a ${field}`
        })
      }
    }
  }

  function validateExists(req, res, next) {
    const orderId = req.params.orderId;
    const index = orders.findIndex((order) => order.id === orderId);
    if (index === -1) {
      const message = `Order does not exist: ${orderId}`;
      return next({ status: 404, message });
    }
    res.locals.order = orders[index];
    res.locals.index = index;
    next();
  }

  function validateId(req, res, next) {
    const id = req.params.orderId;
    const order = orders.find((order) => order.id === id);
    if (!dish) {
      return next({
        status: 404,
        message: `Order not found with id: ${id}`
      });
    }
    res.locals.orderId = id;
    res.locals.order = order;
    next();
  }

  let fields = ["deliverTo", "mobileNumber", "status", "dishes"];

  module.exports = {
    list,
    create: [validateDataExists, ...fields.map(createValidatorFor), create],
    read: [validateExists, read],
    update: [validateExists,...fields.map(createValidatorFor), validateId, update],
    delete: [validateExists, destroy]
  };