import Joi from "joi"

export const updateRoleValidator = {
  params: Joi.object({
    workspaceId: Joi.number().required(),
    userId: Joi.number().required(),
  }).unknown(true), // ဒါလေးထည့်ပေးပါ
  
  body: Joi.object({
    newRole: Joi.string().valid("ADMIN", "MEMBER").uppercase().required(),
  }).unknown(true), // ဒါလေးထည့်ပေးပါ
};