import Joi from "joi";

export const assignTaskUserSchema = Joi.object({
  taskId: Joi.number().integer().positive().required().messages({
    "number.base": "Task ID must be a number.",
    "any.required": "Task ID is required.",
  }),
  userIdToAssign: Joi.number().integer().positive().required().messages({
    "number.base": "User ID to assign must be a number.",
    "any.required": "User ID to assign is required.",
  }),
  workspaceId: Joi.number().integer().positive().required().messages({
    "number.base": "Workspace ID must be a number.",
    "any.required": "Workspace ID is required.",
  }),
  projectId: Joi.number().integer().positive().required().messages({
    "number.base": "Project ID must be a number.",
    "any.required": "Project ID is required.",
  }),
});


export const removeTaskUserSchema = Joi.object({
  taskId: Joi.number().integer().positive().required(),
  userIdToRemove: Joi.number().integer().positive().required(),
  workspaceId: Joi.number().integer().positive().required(),
});