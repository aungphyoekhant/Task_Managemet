import Joi from "joi"

export const workspaceInviteValidator = Joi.object({
  workspaceId: Joi.number().integer().positive().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("ADMIN", "MEMBER", "OWNER").required(),
});