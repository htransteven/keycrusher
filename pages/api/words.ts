import type { NextApiRequest, NextApiResponse } from "next";
import wordBank from "../../assets/words/words.json";

const words = wordBank as string[];

type Data = string[];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  switch (req.method) {
    case "GET": {
      const { count = 30, maxWordLength = 8 } = req.query;
      try {
        const wordCount = parseInt(count as string, 10);
        const wordMap: { [wordIndex: string | number]: string } = {};
        const result = [];
        for (let i = 0; i < wordCount; i++) {
          let wordIndex = Math.floor(Math.random() * (words.length - 1));
          while (
            wordMap[wordIndex] !== undefined ||
            wordMap[wordIndex]?.length > maxWordLength
          ) {
            wordIndex = Math.floor(Math.random() * (words.length - 1));
          }

          result.push(words[wordIndex]);
          wordMap[wordIndex] = words[wordIndex];
        }
        res.status(200).json(result);
      } catch (e) {
        console.log(e);
        res.status(400);
      }
      break;
    }
    default: {
      res.status(405);
    }
  }
}
