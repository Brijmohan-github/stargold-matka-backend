export const failedResponse = (res, message, statusCode = 400, data = null) => {
  return res.status(statusCode).json({
    message,
    status: false,
    data,
  });
};

export const successResponse = (
  res,
  message,
  data = null,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    message,
    data,
    status: true,
  });
};
