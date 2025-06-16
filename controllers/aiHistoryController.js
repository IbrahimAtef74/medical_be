const axios = require('axios');
const History = require('../models/History');
const chatWithAI = async (req, res) => {
const  {data}  = req.body;
 const userId = req.user._id;
 function parseSSE(data) {
  const lines = data.split('\n');
  const event = {};
  for (const line of lines) {
    if (line.startsWith('event:')) {
      event.event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      try {
        event.data = JSON.parse(line.slice(5).trim());
      } catch (e) {
        event.data = line.slice(5).trim(); 
      }
    }
  }
  return event;
}

  if (!data || !Array.isArray(data) || data.length !== 2 || !userId) {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  try {
    const historyEntry = new History({ userId, data });
    await historyEntry.save();
    const x={"data":data};


    const postRes = await axios.post(
      'https://ibrahimatef2274-medical-chatbot.hf.space/gradio_api/call/predict',
      x ,
      { headers: { 'Content-Type': 'application/json' } }
    );
    


    const eventId = postRes.data?.event_id;

    if (!eventId) return res.status(500).json({ error: 'No event_id returned' });
  
    let result = null;
    const maxTries = 2;
    for (let i = 0; i < maxTries; i++) {
      await new Promise(r => setTimeout(r, 3000));

      const getRes = await axios.get(
        `https://ibrahimatef2274-medical-chatbot.hf.space/gradio_api/call/predict/${eventId}`
      );
      
      
      if (getRes.status === 200) {
        const ress=parseSSE(getRes.data);
        if(ress.event==='complete'){
        result = ress.data[0];
        break;}
      }
    }


    if (!result) return res.status(500).json({ error: 'No result from AI model' });


    historyEntry.response = result;
    await historyEntry.save();
    

    return res.json(result);

  } catch (err) {
    console.error('AI chat error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
  
};


module.exports = { chatWithAI };
