export const errorHandler = (err, req, res, next) => {
  console.log("Error:", err.message);

  res.status(500).json({
    message: "Something went wrong on server"
  });
};