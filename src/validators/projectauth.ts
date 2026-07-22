import Joi from "joi";

export const createProjectValidator = Joi.object({
  projectName: Joi.string().required(),
  description: Joi.string().allow(null, '').optional(),
  workspaceId: Joi.number().required(),
  status : Joi.string().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional().messages({
    'date.greater': 'End date must be after start date'
  }),
});

export const updateProjectValidator = {
  params: Joi.object({
    projectId: Joi.number().required(),
    workspaceId: Joi.number().required(),
  }),
  body: Joi.object({
    projectName: Joi.string().optional(),
    description: Joi.string().allow(null, '').optional(),
    status : Joi.string().optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional().messages({
      'date.greater': 'End date must be after start date'
    }),
  }).min(1),
};