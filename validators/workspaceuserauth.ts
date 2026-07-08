import Joi from "joi"
export const getWrokspaceUserValidator = Joi.object({
    userId : Joi.number().integer().positive().required(),
    workspaceId : Joi.number().integer().positive().required(),
})