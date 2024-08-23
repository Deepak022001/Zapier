import express from 'express';
const app = express();
// https://hooks.zapier.com/hooks/catch/1234/5678
app.post('/hooks/catch/:userId/:zapId', (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;

  //   store in db a new trigger
  // push it on to a queue (kafka/redis)
  
});
