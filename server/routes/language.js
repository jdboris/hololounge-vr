import express from "express";
import { HttpError } from "../utils/errors.js";
import * as dotenv from "dotenv";
dotenv.config();

const languageRouter = express.Router();

languageRouter.get("/kanji/:kana", async (req, res) => {
  const { kana } = req.params;

  if (!kana) {
    throw new HttpError("Invalid arguments", 401);
  }

  const url = new URL("https://jlp.yahooapis.jp/JIMService/V2/conversion");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": `Yahoo AppID: ${process.env.YAHOO_API_CLIENT_ID}`,
    },
    mode: "no-cors",
    body: JSON.stringify({
      id: "1234-1",
      jsonrpc: "2.0",
      method: "jlp.jimservice.conversion",
      params: {
        q: req.params.kana,
        format: "hiragana",
        mode: "kanakanji",
        option: [
          "hiragana",
          "katakana",
          "alphanumeric",
          "half_katakana",
          "half_alphanumeric",
        ],
        dictionary: ["base", "name", "place", "zip", "symbol"],
        results: 999,
      },
    }),
  });

  if (!response.ok) {
    throw new HttpError(await response.text(), response.status);
  }

  const { result } = await response.json();

  if (!result) {
    res.json([]);
    return;
  }

  const kanjis = result.segment.reduce((kanjis, segment) => {
    return [...kanjis, ...segment.candidate];
  }, []);

  res.json(kanjis);
});

export default languageRouter;
