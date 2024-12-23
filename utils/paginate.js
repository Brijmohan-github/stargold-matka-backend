export const defaultPaginate = async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  req.query.limit = limit;
  req.query.skip = skip;
  next();
};
