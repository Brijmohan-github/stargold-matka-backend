import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./utils/swagger.js";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { userRouter } from "./routes/userRouter.js";
import "./controllers/cronJobController.js";
import { adminRouter } from "./routes/adminRouter.js";
import { gameRouter } from "./routes/gameRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// app.use(cors());
const corsOptions = {
  origin: ['https://admin.ratankhichi.com'], // Allow multiple origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true, // Allow cookies or authentication headers
  optionsSuccessStatus: 204, // For legacy browsers
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  morgan.token("headers", (req) => JSON.stringify(req.headers));
  morgan.token("body", (req) => JSON.stringify(req.body));
  morgan.token("query", (req) => JSON.stringify(req.query));
  morgan.token("params", (req) => JSON.stringify(req.params));
  morgan.token("files", (req) => {
    if (req.files) {
      return JSON.stringify(req.files.map((file) => file.originalname));
    } else if (req.file) {
      return JSON.stringify(req.file.originalname);
    } else {
      return "No files";
    }
  });
  const simplifiedLoggingFormat =
    ":url Body: :body Query: :query Params: :params Files: :files";
  app.use(morgan(simplifiedLoggingFormat));
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "/index.html"));
});

app.get("/user/gettransectionstatus`", (req, res) => {
  res.sendFile(join(__dirname, "/paymentproceed.html"));
});

// swagger setup
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//routes
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/game", gameRouter);

export default app;
