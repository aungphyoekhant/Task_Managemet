import Joi from "joi"

export const upsertProfileValidator = Joi.object({
    name: Joi.string()
        .min(4)
        .max(30)
        .required(),

    phone: Joi.string() 
        .pattern(/^[0-9]+$/)
        .min(7)
        .max(15)
        .optional(),

    avatar: Joi.string()
       .pattern(/\.(jpg|jpeg|png)$/i)
       .optional()
       .required(),

    jobTitle: Joi.string()
        .max(50)
        .optional(),

    bio: Joi.string()
        .max(200)
        .optional(),

    userId: Joi.number()
        .required(),
});