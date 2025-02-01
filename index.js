const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use(cors());

//mongodb
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${user}:${password}@clusterryusen.ptw8o.mongodb.net/?retryWrites=true&w=majority&appName=ClusterRyusen`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const campaignCollection = client
      .db("crowdDB")
      .collection("campaignCollection");
    const userCollection = client.db("crowdDB").collection("useerCollection");

    app.get("/campaigns", async (req, res) => {
      const allCampaigns = await campaignCollection.find().toArray();
      res.send(allCampaigns);
    });

    app.get("/trendingCampaigns", async (req, res) => {
      const trendingCampaigns = await campaignCollection
        .find()
        .limit(6)
        .toArray();
      res.send(trendingCampaigns);
    });

    app.get("/myCampaign/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { UID: id };
        const campaigns = await campaignCollection.find(query).toArray();

        if (!campaigns.length) {
          return res
            .status(404)
            .send({ message: "No campaigns found for this UID" });
        }
        res.send(campaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/campaignDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const campaign = await campaignCollection.findOne(query);
      res.send(campaign);
    });

    app.post("/campaigns", async (req, res) => {
      const newCampaign = req.body;
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result);
    });

    app.delete("/deleteCampaign/:id", async(req, res) => {
      const id = req.params.id;
      const query = { UID : id };
      const result = await campaignCollection.deleteOne(query);
      res.send(result);
    })

    // User Segment

    app.get("/users", async (req, res) => {
      const allUsers = await userCollection.find().toArray();
      res.send(allUsers);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { UID: id };
      const user = await userCollection.findOne(query);
      res.send(user);
    });

    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const {donationAmount} = req.body;
      const result = await userCollection.updateOne(
        { UID: id },
        { $set: { donationAmount: donationAmount } }
      )
      res.send(result)
    })

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is OKAY to go!");
});

app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
