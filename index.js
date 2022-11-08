const express=require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors=require('cors')
require('dotenv').config()
const port=process.env.PORT || 5000
const app=express();


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8ky5qyn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        
        const serviceCollection=client.db('Tour-service').collection('services')
        
        app.get('/services',async(req,res)=>{
            const size=parseInt(req.query.size); 
            const query={}
            const cursor=serviceCollection.find(query)
            const services=await cursor.limit(size).toArray();
            res.send(services)
            console.log(services);
        });
    }
    finally{

    }
}

run()
.catch(error=>console.log(error.message))


app.get('/',(req,res)=>{
    res.send('Mannat Tour Service Server is running....')
})

app.listen(port,()=>{
    console.log(`Mannat Server is running on port ${port}`);
})