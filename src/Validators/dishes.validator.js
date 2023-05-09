// Validation middleware functions for dishes
function validateDishData(req, res, next) {
    const { data } = req.body;
    if (!data) {
      return next({
        status: 400,
        message: "Dish must include a data object",
      });
    }
    next();
  }
  
  function validateName(req, res, next) {
    const { data } = req.body;
    const name = data.name;
    if (!name || name === "") {
      return next({
        status: 400,
        message: "Dish must include a name",
      });
    }
    next();
  }
  
  function validateDescription(req, res, next) {
    const { data } = req.body;
    const description = data.description;
    if (!description || description === "") {
      return next({
        status: 400,
        message: "Dish must include a description",
      });
    }
    next();
  }
  
  function validateImageUrl(req, res, next) {
    const { data } = req.body;
    const imageUrl = data.image_url;
    if (!imageUrl || imageUrl === "") {
      return next({
        status: 400,
        message: "Dish must include an image_url",
      });
    }
    next();
  }
  
  function validatePrice(req, res, next) {
    const { data } = req.body;
    const price = data.price;
    if (!price || isNaN(price) || price <= 0) {
      return next({
        status: 400,
        message: "Dish must have a price that is a positive number",
      });
    }
    next();
  }
  
  function validateDishExists(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (!foundDish) {
      return next({
        status: 404,
        message: `Dish does not exist: ${dishId}`,
      });
    }
    res.locals.dish = foundDish;
    next();
  }
  
  function validateDishId(req, res, next) {
    const dishId = req.params.dishId;
    const { data } = req.body;
    const id = data.id;
  
    if (id && dishId !== id) {
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
    next();
  }
  
  module.exports = {
    validateDishData,
    validateName,
    validateDescription,
    validateImageUrl,
    validatePrice,
    validateDishExists,
    validateDishId,
  };