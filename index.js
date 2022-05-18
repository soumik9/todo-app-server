const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@todo.zjxkw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {

        // connect to mongodb collection
        await client.connect();
        const tasksCollection = client.db("todo-app").collection("tasks");
        const userCollection = client.db("todo-app").collection("users");

        // api homepage
        app.get('/', (req, res) => {
            res.send('Todo App Server Is Ready')
        })

        // on login get user info
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body
            const filter = { email: email };
            const options = { upsert: true };

            const updateDoc = {
                $set: user,
            }

            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
            res.send({ result, token });
        })

        // get tasks
        app.get('/tasks', async (req, res) => {
            const tasks = await tasksCollection.find().toArray();
            res.send(tasks);
        })

        // add task
        app.post('/add-task', async (req, res) => {
            const task = req.body;
            const result = await tasksCollection.insertOne(task);
            return res.send(result);
        })

        // update task status
        app.put('/task/:taskId', async (req, res) => {
            const id = req.params.taskId;
            const updatedTask = req.body;
            console.log(updatedTask);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updatedDoc = {
                $set: {
                    status: updatedTask.newStatus,
                }
            }

            const result = await tasksCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // api delete product
        app.delete('/task/:taskId', async (req, res) => {
            const id = req.params.taskId;
            const query = { _id: ObjectId(id) };
            const result = await tasksCollection.deleteOne(query);
            res.send(result);
        })

    } finally {

    }
}

run().catch(console.dir);

// port listening
app.listen(port, () => {
    console.log('Listening to port, ', port);
})