import Fictioneers from "fictioneers-node-sdk";
import { progressToNextQuestionContent, questionContent, generateHash } from "../../helpers/helpers";

export default async function handler(req, res) {
  const { body } = req;
  const jsonBody = JSON.parse(body);
  const fictioneers = new Fictioneers({
    apiSecretKey: process.env.SECRET_KEY,
    userId: jsonBody.userId,
  })
  // Check timeout
  const timestamp = new Date(jsonBody.startTime.timestamp);
  const hash = generateHash(jsonBody.startTime.timestamp);
  const threshold = new Date(new Date(Date.now()) - (60 * 1000 * parseInt(process.env.THRESHOLD)));
  if (hash != jsonBody.startTime.hash || timestamp < threshold) {
    res.status(200).json({
      result: 'timeout',
      userId: jsonBody.userId,
    });
    return;
  }
  // Get user state
  const ficResponse = await fictioneers.getUserTimelineEvents();
  const currentQuestion = ficResponse.data.filter(e => e.id == jsonBody.questionId)[0];
  const skippedQuestions = ficResponse.data.filter(e => e.thread_id != null && e.state == 'SKIPPED')
  // If skips < 3
  if (skippedQuestions.length < 3) {
    // Mark question skipped
    await fictioneers.updateUserTimelineEvent({
      timelineEventId: currentQuestion.id,
      state: 'SKIPPED',
    });
    // Progress user
    const result = await progressToNextQuestionContent(fictioneers, res)
    if (!result) {
      return;
    }
    const [questionId, content] = result;
    // Get content
    const [answers, image] = await questionContent(content[0].content_id)
    // Return skipped response
    res.status(200).json({
      result: 'skipped',
      userId: jsonBody.userId,
      questionId,
      question: {
        answers,
        image,
      },
    });
  } else {
    res.status(400).json({});
  }
}
