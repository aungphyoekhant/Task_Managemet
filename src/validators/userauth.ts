import Joi from "joi";

export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(12).required(),
  invitationId: Joi.number().integer().optional(),
});

export const registerValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(12).required(),
  confirmPassword: Joi.ref("password"),
  name: Joi.string().min(4).max(30).required(),
  token: Joi.string().optional().allow(null, ""),
});


