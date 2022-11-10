const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express();


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8ky5qyn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded
        next()
    })
}

async function run() {
    try {

        const serviceCollection = client.db('Tour-service').collection('services')
        const reviewCollection = client.db('Tour-service').collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })

        app.get('/services', async (req, res) => {
            const size = parseInt(req.query.size);
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(size).toArray();
            res.send(services)
            
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        });

        app.get('/reviews',verifyJWT, async (req, res) => {
            const decoded = req.decoded
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }

            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
             
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

         
        // all review under a service ..api
         app.get('/serviceReview',async(req,res)=>{
           
            let query={} 
            
             if (req.query.serviceId) {
                query = {
                    serviceId: req.query.serviceId
                }
            }
            const cursor=reviewCollection.find(query);
            const data=await cursor.toArray()
            const reviews=data.reverse()
            res.send(reviews)
        })

       
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const review = await reviewCollection.findOne(query);
            res.send(review)
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review);
            res.send(result)

        });

        app.post('/services', async (req, res) => {
            const service = req.body
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })
         
        // update api
        app.put('/reviews/:id',verifyJWT, async(req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const review = req.body
            const option = { upsert: true };
            const updatedReview = {
                $set: {
                    customer: review.customer,
                    text: review.text,
                    rating: review.rating,
                    photo: review.photo
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            res.send(result);
        })
        
        // delete api
        app.delete('/reviews/:id',verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })
    }
    finally {

    }
}

run()
    .catch(error => console.log(error.message))


app.get('/', (req, res) => {
    res.send('Mannat Tour Service Server is running....')
})

app.listen(port, () => {
    console.log(`Mannat Server is running on port ${port}`);
})