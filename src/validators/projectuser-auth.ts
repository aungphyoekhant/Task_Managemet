import Joi from "joi";

export const addProjectMemberValidator = Joi.object({
  projectId: Joi.number().required(),
  workspaceId: Joi.number().required(),
  userId: Joi.number().optional(),
  userIds: Joi.array().items(Joi.number()).optional(),
  role: Joi.string().valid("OWNER", "ADMIN", "MEMBER").optional(),
}).or("userId", "userIds");


export const removeMemberValidator = Joi.object({
  workspaceId: Joi.number().required(),
  // userId: Joi.number().required(),
  projectId: Joi.number().required(),
  projectUserId: Joi.number().required(),
});