import Joi from "joi";

export const addProjectMemberValidator = Joi.object({
  projectId: Joi.number().required(),
  assignedTo: Joi.number().required(),
  workspaceId: Joi.number().required(),
});


export const removeMemberValidator = Joi.object({
  projectUserId: Joi.number().required(),
});