const express=require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const reviewCollection=client.db('Tour-service').collection('reviews');

        app.get('/services',async(req,res)=>{
            const size=parseInt(req.query.size); 
            const query={}
            const cursor=serviceCollection.find(query)
            const services=await cursor.limit(size).toArray();
            res.send(services)
            // console.log(services);
        });

        app.get('/services/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const service=await serviceCollection.findOne(query)
            res.send(service)
         });

         app.get('/reviews',async(req,res)=>{
     
             let query={}
             if(req.query.email){
                 query={
                     email:req.query.email
                 }
             }
             else if(req.query.serviceId){
                query={
                    serviceId:req.query.serviceId
                }
             }
             const cursor=reviewCollection.find(query)
             const reviews=await cursor.toArray()
             res.send(reviews)
         })
        
         app.get('/reviews/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const review=await reviewCollection.findOne(query);
            res.send(review)
        })

         app.post('/reviews',async(req,res)=>{
            const review=req.body 
            const result=await reviewCollection.insertOne(review);
            res.send(result)
    
        });

        app.post('/services',async(req,res)=>{
            const service=req.body 
            const result=await serviceCollection.insertOne(service)
            res.send(result)
        })

        app.put('/reviews/:id',async(req,res)=>{
            const id=req.params.id
            const filter={_id:ObjectId(id)}
            const review=req.body
            const option={upsert:true};
            const updatedReview={
                $set:{
                    customer:review.customer,
                    text:review.text,
                    rating:review.rating,
                    photo:review.photo
                }
            }
          const result=await reviewCollection.updateOne(filter,updatedReview,option);
            res.send(result);
        })

        app.delete('/reviews/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result=await reviewCollection.deleteOne(query)
            res.send(result)
        })
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