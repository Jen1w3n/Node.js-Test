//Call libraries/dependencies
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const app = express();
app.use(bodyParser.json());
app.use(express.json());
const uuid = require('uuid');
const port = 5000;

//MongoDB Database
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jennadebeer01:1405@cluster0.zlddtx3.mongodb.net/?retryWrites=true&w=majority";

//Create a MongoClient to set the Stable API
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); //Use with MongoClientOptions object 
let collection;

//Connect to database
async function connectToMongoDB() 
{
	try 
	{
	  await client.connect();
	  console.log("Connected to MongoDB.");
	  const db = client.db("Users");
	  collection = db.collection("User_details");
	} catch (error) 
	{
	  console.error("Failed to connect to MongoDB:", error);
	}
  }
  connectToMongoDB();

//Allow PUT and Delete requests
let allowCrossDomain = function (req, res, next)
{
    res.header('Access-Control-Allow-Origin', "");
    res.header('Access-Control-Allow-Headers', "");
    res.header('Access-Control-Allow-Methods', "");
    next();
}
app.use(allowCrossDomain);

//POST a new user to the json
router.post('/add-user', async (req, res) => 
{
	try 
		{
		const addUser = req.body;
		if (!addUser || 
			!addUser.firstName || 
			!addUser.lastName || 
			!addUser.email || 
			!addUser.role) 
		{
		  console.log("Incomplete fields.");
		  return res.status(500).json({ error: 'Incomplete fields.' });
		}
	
		  await client.connect();
	
		  const collection = client.db("Users").collection("User_details");
	
		  //Create username
		  addUser.username = await newUsername(addUser);
		  //Create ID
		  addUser.id = uuid.v4();
	
		  //Insert new user into DB
		  await collection.insertOne(addUser);
	
		  res.json(addUser);
		} 
		catch (err) 
		{
		  console.error(err);
		  res.status(500).send(err);
		} 
		finally 
		{
		  await client.close();
		}
	
//Create new username
async function newUsername(addUser) 
{
	const firstName = addUser.firstName;
	const lastName = addUser.lastName;
	let username = null;
	username += firstName.substring(0, 3).toLowerCase();
	console.log("first Name: " + firstName);
	console.log("last Name: " + lastName);
  
	const vowels = ["a", "e", "i", "o", "u"];
	let counter = 0;
  
	for (let letter of lastName.toLowerCase()) 
	{
	  if (!vowels.includes(letter) && counter < 3) 
	  {
		username += letter.toLowerCase();
		counter++;
	  }
	}
  
	if (counter < 3) 
	{
	  while (counter < 3) 
	  {
		username += 'x';
		counter++;
	  }
	}
	let occurrence = 1; //Ensure usernames are unique
  
	try 
	{
	  //Find matching usernames
	  const regex = new RegExp('^' + username, 'i');
	  const result = await collection.find({ username: regex }).toArray();
  
	  //Find maximum number of usernames
	  const maxIdentical = result.reduce((max, user) => 
	  {
		const numberIdentical = parseInt(user.username.substring(6, 9));
		return numberIdentical > max ? numberIdentical : max;
	  }, 0);
  
	  occurrence = maxIdentical + 1;
	} 
	  catch (err) 
	{
	  console.error(err);
	} 
	username += String(occurrence).padStart(3, '0');
	console.log(username);
	return username;
  }	
});

//GET all users from DB
router.get('/get-users', async (req, res) => 
{
	try 
	{
		//Connect to database cluster
		await client.connect();
	
		//Access the "users" database and "User_details" collection
		const collection = client.db("Users").collection("User_details");
		//Searh for all users
		const users = await collection.find().toArray();
	    console.log(users);
		res.send(users);
	  } 
	  	catch (err) 
		{
		console.error(err);
		res.status(200).json({ error: 'Internal Server Error' });
	  	} 
	  	finally 
	  	{
		//Close client connection
		await client.close();
	  }
});

//GET a user based on username
router.get('/get-user/:username', async (req, res) => 
{
	const username = req.params.username;

	try 
	{
		await client.connect();
	
		const collection = client.db("Users").collection("User_details");
	
		//Find user with matching username
		const user = await collection.findOne({ username });
	
		if (!user) 
		{
		  return res.status(404).json({ error: 'User not found.' });
		}
	
		res.json(user);
	  	}
	 	catch (err) 
		{
		console.error(err);
		res.status(200).json({ error: 'Internal Server Error' });
	  	} 
		finally 
		{
		await client.close();
	  }
});

//DELETE user based on username
router.delete('/delete-user/:username', async (req, res) => 
{
	try {
		const username = req.params.username;
	
		await client.connect();
		const collection = client.db("Users").collection("User_details");
	
		//Delete user
		const result = await collection.findOneAndDelete({ username });
	
		if (!result.value) {
		  return res.json({ error: 'User not found.' });
		}
		
		const user = result.value;
		user.success = "User deleted."; 
		console.log("User deleted.");
		res.send(user);
	  } 
	  	catch (err) 
	  {
		console.error(err);
		res.status(200).json({ error: 'Internal Server Error.' });
	  } 
	  	finally 
	  {
		await client.close();
	  }
});

//PUT to edit user details
router.put('/edit-user', async (req, res) => 
{
	try {
		const editUser = req.body;
	
		if (!editUser || 
			!editUser.firstName ||
			 !editUser.lastName || 
			 !editUser.email || 
			 !editUser.role || 
			 !editUser.username || 
			 !editUser.id) 
		{
		  console.log("Incomplete fields.");
		  return res.status(500).json({ error: 'Incomplete fields.' });
		}
	
		await client.connect();
		const collection = client.db("Users").collection("User_details");
	
		//Find user
		const filter = { username: editUser.username, id: editUser.id };
		const update = { $set: editUser };
		const options = { returnOriginal: false };
		const result = await collection.findOneAndUpdate(filter, update, options);
	
		if (!result.value) 
		{
		  return res.json({ error: 'User not found.' });
		}
	
		res.json(editUser);
	  	} catch (err) 
		{
		console.error(err);
		res.status(200).json({ error: 'Internal Server Error' });
	  	} finally 
		{
		await client.close();
	  	}
});

app.use('/', router);
app.listen(port, () =>
{
	console.log('Server is running on port ' + port);
});

//Middleware sends data to server.js
module.exports = router;