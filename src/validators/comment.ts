import Joi from "joi";

export const addCommentValidator = {
  params: Joi.object({
    taskId: Joi.number().required(),
  }),
  body: Joi.object({
    content: Joi.string().trim().required().max(1000).messages({
      'string.empty': 'Content is required',
      'string.max': 'Content too long'
    }),
  }),
};

export const updateCommentValidator = {
  params: Joi.object({
    commentId: Joi.number().required(),
  }),
  body: Joi.object({
    content: Joi.string().trim().required().max(1000).messages({
      'string.empty': 'Content is required',
      'string.max': 'Content too long'
    }),
  }),
};