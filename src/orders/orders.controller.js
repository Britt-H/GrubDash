const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

//middleware -------------------------------------------------------
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

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({
          status: 400,
          message: `dish must include include ${propertyName}`
      });
    };
  }

  function dishesPropertyIsValid(req, res, next) {
    const { data:  {dishes}  } = req.body;
        if(Array.isArray(dishes) && dishes.length > 0){
            next()
        }else{
            next({
                status: 400,
                message: `Order must include at least one dish`
            })
        }
  }

function quantityIsValid(req, res, next){
    const { data:  {dishes}  } = req.body;
    for(let i = 0; i < dishes.length; i++){
        let quantity = dishes[i].quantity;
        if(!quantity || typeof quantity !== 'number' || quantity < 1){
            return next({
                    status: 400,
                    message: `Dish ${i} must have a quantity that is an integer greater than 0`
                })
        }    
    }
    next();
}

function validateOrderExists(req, res, next) {
    let { orderId } = req.params;
    orderId = orderId;
    let index = orders.findIndex(order => order.id === orderId);
    if (index > -1) {
      let order = orders[index];
      res.locals.order = order;
      res.locals.index = index;
      next();
    } else {
      next({
        status: 404,
        message: `Could not find order with id ${orderId}`
      })
    }
}

function validateStatus(req, res, next){
    let { data : { status } } = req.body;
    if(status === '' || !status || status === 'invalid'){
        next({
            status: 400,
            message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
          });
    }else if(status === 'delivered'){
        next({
            status: 400,
            message: 'A delivered order cannot be changed'
          });
    }else{
        next();
    }
}

function deleteOrderExists(req, res, next) {
    let { orderId } = req.params;
    orderId = orderId;
    let index = orders.findIndex(order => order.id === orderId);
    if (index > -1) {
      let order = orders[index];
      res.locals.order = order;
      res.locals.index = index;
      next();
    } else {
      next({
        status: 404,
        message: `Could not find order with id ${orderId}`
      })
    }
}

function isPending(req, res, next){
    let {status} = res.locals.order;
    if(status !== 'pending'){
        next({
            status: 400,
            message: 'An order cannot be deleted unless it is pending.'
          });
    }else{
        next();
    }
}

//lists all orders---------------------------------------------------
function list(req, res, next) {
    res.send({ data: orders })
}

//---------CREATE(post)-------------------------------------------------------

function create(req, res, next) {
    let { deliverTo, mobileNumber, dishes } = req.body.data;

    let newOrder = {
      "deliverTo": deliverTo,
      "mobileNumber": mobileNumber,
      "dishes": dishes,
      "id": nextId(),
    };
    orders.push(newOrder);
    res.status(201).json({data: newOrder});
}

//UPDATE-------------------------------------------------
function update(req, res, next) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  
    // update the paste
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
  
    res.json({ data: order });
  }

  function validateUpdateId(req, res, next){
    const orderId = res.locals.order.id
    const{ data: { id } = {} } = req.body;

    if(!id || orderId === id){
        next()
    } else {
        next({
            status: 400,
            message: `id: ${id} does not match`
          })
    }
}


//---------------READ--------------------------------------
function read(req, res, next) {
    const { order } = res.locals;
    res.send({ data: order })
}

//DELETE/DESTROY --------------------------------------------------------
function destroy(req, res, next) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    orders.splice(index, 1);
    res.sendStatus(204);
  }


module.exports = {
    list,
    create: [
        validateDataExists,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        dishesPropertyIsValid,
        quantityIsValid,
        create],
    read: [
        validateOrderExists,
        read],
    update: [
        validateOrderExists,
        validateUpdateId,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        dishesPropertyIsValid,
        quantityIsValid,
        validateStatus,
        update],
    delete: [
        deleteOrderExists,
        isPending,
        destroy]
}