import ApiError from "../utils/ApiError.js";

//we are usin zod for validation and defining the things that are needed for zod validation, the actual validation is done in auth.validation.js file
const validate = (schema) => {
  return async (req, res, next) => {
    const result = await schema.safeParseAsync({
      body: req.body ?? {},
      params: req.params ?? {},
      query: req.query ?? {},
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new ApiError(400, "Request validation failed.", errors));
    }

    req.validatedData = result.data;

    next();
  };
};

export default validate;
 