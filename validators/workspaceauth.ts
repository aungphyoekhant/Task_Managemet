import Joi from "joi";

export const createWorkspaceValidator = Joi.object({
name : Joi.string().min(4).max(30).required(),
userId : Joi.number().integer().positive().required(),
logo : Joi.string()
.optional()
.allow(null, ""),
})

export const modifyWorkspaceValidator = Joi.object({
    name : Joi.string().min(4).max(30).required(),
    workspaceId : Joi.number().integer().positive().required(),
    userId: Joi.number().integer().positive().required(),
    logo: Joi.string()
    .pattern(/\.(jpg|jpeg|png)$/i)
    .optional()
    .required()
})

export const dropWorkspaceValidator = Joi.object({
    userId : Joi.number().integer().positive().required(),
    workspaceId : Joi.number().integer().positive().required()
})

export const getWorkspaceValidator = Joi.object({
    userId : Joi.number().integer().positive().required(),
    workspaceId : Joi.number().integer().positive().required(),
})