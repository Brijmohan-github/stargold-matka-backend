import swaggerJSDoc from "swagger-jsdoc";
import "dotenv/config";
const definition = {
  info: {
    title: "MatkaAPI",
    version: "1.0.0",
    description: "Your API Description",
  },
  host: `${process.env.SERVER_HOST}`, // Server host
  basePath: "/", // Base path for all API endpoints
};

const options = {
  definition,
  apis: ["./../routes/initRouter.js"],
};
const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
