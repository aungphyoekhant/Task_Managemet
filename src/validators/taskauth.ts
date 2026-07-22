import Joi from "joi"

export const createTaskValidator = Joi.object({
    workspaceId: Joi.number().integer().positive().required(),
    userId : Joi.number().integer().positive().required(),
    projectId : Joi.number().integer().positive().required(),
    title: Joi.string().min(4).max(30).required(),
    description: Joi.string().allow(null, '').optional(),
    priority: Joi.string().valid("LOW","MEDIUM","HIGH").uppercase().optional(),
    status:Joi.string().valid("IN_PROGRESS","TODO","DONE").uppercase().optional(),
    dueDate:Joi.date().greater("now").iso().messages({
      "date.greater": "Due date must be in the future",
      "date.isoDate": "Invalid date format, please use YYYY-MM-DD"
    }).optional(),
})

export const updateTaskValidator = {
  params: Joi.object({
    taskId: Joi.number().required(),
  }),
  body: Joi.object({
    workspaceId: Joi.number().required(),
    title: Joi.string().optional(),
    description: Joi.string().allow(null, '').optional(),
    priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").optional(),
    status: Joi.string().valid("TODO", "IN_PROGRESS", "DONE").optional(),
    dueDate: Joi.date().iso().optional(),
  }).unknown(true),
};


export const updateAssignedTaskValidator = {
  params: Joi.object({
    taskId: Joi.number().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid("TODO", "IN_PROGRESS", "DONE").optional(),
    priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").optional(),
  }).min(1),
};