/* eslint-disable @typescript-eslint/no-var-requires */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("path");
const os = require("os");
const fs = require("fs");
const datefns = require("date-fns");
const datefnsTz = require("date-fns-tz");

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

export const scheduledFunctionCrontab = functions.pubsub
  .schedule("50 23 * * *")
  .timeZone("America/Los_Angeles") // Users can choose timezone - default is America/Los_Angeles
  .onRun(async () => {
    // Download file from bucket.
    const bucket = admin.storage().bucket();
    const tempFilePath = path.join(os.tmpdir(), "words.json");
    await bucket.file("words.json").download({ destination: tempFilePath });
    functions.logger.log("Downloaded words.json from storage", tempFilePath);

    fs.readFile(tempFilePath, (err: unknown, data: unknown) => {
      if (err) throw err;
      const words = JSON.parse(data as string) as string[];
      const wordCount = 25;
      const wordMap: { [wordIndex: string | number]: string } = {};
      const result = [];
      for (let i = 0; i < wordCount; i++) {
        let wordIndex = Math.floor(Math.random() * (words.length - 1));
        while (wordMap[wordIndex] !== undefined) {
          wordIndex = Math.floor(Math.random() * (words.length - 1));
        }

        result.push(words[wordIndex]);
        wordMap[wordIndex] = words[wordIndex];
      }

      const newDailyChallenge: {
        text: string;
        sumTime: number;
        sumWPM: number;
        sumAccuracy: number;
        attempts: number;
      } = {
        text: result.join(" "),
        sumTime: 0,
        sumWPM: 0,
        sumAccuracy: 0,
        attempts: 0,
      };

      functions.logger.log("Daily Challenge Text: ", newDailyChallenge.text);
      admin
        .firestore()
        .collection("daily")
        .doc(
          datefnsTz.formatInTimeZone(
            datefns.addDays(
              datefnsTz.utcToZonedTime(Date.now(), "America/Los_Angeles"),
              1
            ),
            "America/Los_Angeles",
            "MM-dd-yyyy"
          )
        )
        .create(newDailyChallenge);
    });

    // delete temporary words file
    await fs.unlink(tempFilePath, () => {
      functions.logger.log("Deleted file at: ", tempFilePath);
    });
  });
