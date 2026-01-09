import { callGroq } from "./groqTest.js";

(async () => {
  const answer = await callGroq("Explain AI in simple terms.");
  console.log("Chat answer:", answer);
})();
