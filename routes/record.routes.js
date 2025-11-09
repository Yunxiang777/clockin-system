import express from "express";
import { clockIn } from "../controllers/record.controller.js";

const router = express.Router();

router.post("/clockin", clockIn);

export default router;
