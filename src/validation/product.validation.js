const Joi = require("joi")
const productValidation = Joi.object({

  //Required fields
  name:Joi.string()
    .max(200) 
    .required(),

 shortDescription:Joi.string()
    .max(500)
    .required(),

  description:Joi.string()
    .required(),

  price:Joi.number()
    .min(0)
    .required(),

  stock:Joi.number()
    .integer()
    .min(0)
    .required(),

  images:Joi.array()
    .items(
      Joi.object({
        public_id:Joi.string()
        .required(),

        url:Joi.string()
        .required()
      })
    )
   .min(1)
   .required(),

  category:Joi.string()
    .lowercase()
    .required(),

  createdBy:Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),

    
  //Optional fields
  discountPrice:Joi.number()
    .min(0),

  sku:Joi.string(),

  subcategory:Joi.string(),

  brand:Joi.string(),

  tags:Joi.array()
    .items(Joi.string()),

  reviews:Joi.array()
    .items(
      Joi.object({
        user:Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),

        rating:Joi.number()
          .min(1)
          .max(5)
          .required(),

        comment:Joi.string()
          .required(),

        })
      ),

    featured:Joi.boolean()
      .default(false),
    
    isActive:Joi.boolean()
     .default(true),

});

module.exports =productValidation;


