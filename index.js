const express = require('express')
const cors = require('cors')
require("dotenv").config();
const app = express()
const port = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use(cors());

//mongodb
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${user}:${password}@clusterryusen.ptw8o.mongodb.net/?retryWrites=true&w=majority&appName=ClusterRyusen`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const campaignCollection = client.db('crowdDB').collection('campaignCollection');

    app.get('/campaigns', async(req, res) => {
        const allCampaigns = await campaignCollection.find().toArray();
        res.send(allCampaigns);
    })

    app.get('/trendingCampaigns', async(req, res) => {
      const trendingCampaigns = await campaignCollection.find().limit(6).toArray();
      res.send(trendingCampaigns);
    })

    app.get('/campaignDetails/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const campaign = await campaignCollection.findOne(query);
      res.send(campaign);
    })

    app.post('/campaigns', async(req, res) => {
      const newCampaign = req.body;
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result)
    })
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Server is OKAY to go!")
})

app.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`)
})