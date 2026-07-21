import Joi from "joi";

export const addProjectMemberValidator = Joi.object({
  projectId: Joi.number().required(),
  userId: Joi.number().required(),
  workspaceId: Joi.number().required(),
});


export const removeMemberValidator = Joi.object({
  projectId: Joi.number().required(),
  projectUserId: Joi.number().required(),
});