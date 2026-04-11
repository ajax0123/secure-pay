// Module: validateRequest | Responsibility: Validate request payloads using Zod schemas before controller execution.
const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: result.error.flatten()
    });
  }
  req.validatedBody = result.data;
  return next();
};

module.exports = validateRequest;
