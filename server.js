//Call libraries/dependencies
const bodyParser = require('body-parser');
//const path = require('path');
const express = require('express');
const router = express.Router();
const app = express();
app.use(bodyParser.json());
app.use(express.json());
const uuid = require('uuid');
//const consonantsRegex = /[bcdfghjklmnpqrstvwxyz]/i; //Match consonants in last name
const port = 3000;

//MongoDB Database
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://jennadebeer01:1405@cluster0.zlddtx3.mongodb.net/?retryWrites=true&w=majority";

//Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let collection;

// Connect to MongoDB
async function connectToMongoDB() {
	try {
	  await client.connect();
	  console.log("Connected to MongoDB");
	  const db = client.db("Users");
	  collection = db.collection("User_details");
	} catch (error) {
	  console.error("Failed to connect to MongoDB:", error);
	}
  }
  
  connectToMongoDB();

//Allows PUT and Delete requests
let allowCrossDomain = function (req, res, next)
{
    res.header('Access-Control-Allow-Origin', "");
    res.header('Access-Control-Allow-Headers', "");
    res.header('Access-Control-Allow-Methods', "");
    next();
}

app.use(allowCrossDomain);

//GET all users available in the JSON
router.get('/get-users', async (req, res) => 
{
	try {
		// Connect to the MongoDB cluster
		await client.connect();
	
		// Access the "users" database and "User_details" collection
		const collection = client.db("Users").collection("User_details");
		// Find all users
		const users = await collection.find().toArray();
	    console.log(users);
		res.send(users);
	  } catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal Server Error' });
	  } finally {
		// Close the MongoDB client connection
		await client.close();
	  }
});

//GET a user based on the username of the user
router.get('/get-user/:username', async (req, res) => 
{
	const username = req.params.username;

	try {
		// Connect to the MongoDB cluster
		await client.connect();
	
		// Access the "users" database and "Backend_Intern" collection
		const collection = client.db("Users").collection("User_details");
	
		// Find the user with the matching username
		const user = await collection.findOne({ username });
	
		if (!user) {
		  return res.status(404).json({ error: 'User not found.' });
		}
	
		res.json(user);
	  } catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal Server Error' });
	  } finally {
		// Close the MongoDB client connection
		await client.close();
	  }
});

//POST a new user to the json
router.post('/add-user', async (req, res) => 
{
	try {
		const newUser = req.body;
		if (!newUser || !newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role) {
		  console.log("Fields empty or incomplete");
		  return res.status(500).json({ error: 'Fields empty or incomplete.' });
		}
	
		  // Connect to the MongoDB cluster
		  await client.connect();
	
		  // Access the "users" database and "Backend_Intern" collection
		  const collection = client.db("Users").collection("User_details");
	
		  // Generate username and ID
		  newUser.username = await generateUsername(newUser);
	
		  // Generate username and ID
		  newUser.id = uuid.v4();
	
		  // Insert the new user into the collection
		  await collection.insertOne(newUser);
	
		  res.json(newUser);
		} catch (err) {
		  console.error(err);
		  res.status(500).send(err);//json({ error: 'Internal Server Error' });
		} finally {
		  // Close the MongoDB client connection
		  await client.close();
		}
	
// Generate username function
async function generateUsername(newUser) {
	const firstName = newUser.firstName;
	const lastName = newUser.lastName;
	let username = "";
	username += firstName.substring(0, 3).toLowerCase();
	console.log("first Name: " + firstName);
	console.log("last Name: " + lastName);
  
	const vowels = ["a", "e", "i", "o", "u"];
  
	let counter = 0;
  
	for (let letter of lastName.toLowerCase()) {
	  if (!vowels.includes(letter) && counter < 3) {
		username += letter.toLowerCase();
		counter++;
	  } else if (counter < 3) {
		break;
	  }
	}
  
	if (counter < 3) {
	  while (counter < 3) {
		username += 'x';
		counter++;
	  }
	}
  
	let occurrence = 1;
  
	try {
	  // Query the database to find users with matching usernames
	  const regex = new RegExp('^' + username, 'i');
	  const result = await collection.find({ username: regex }).toArray();
  
	  // Find the maximum occurrence for the matching usernames
	  const maxOccurrence = result.reduce((max, user) => {
		const userOccurrence = parseInt(user.username.substring(6, 9));
		return userOccurrence > max ? userOccurrence : max;
	  }, 0);
  
	  occurrence = maxOccurrence + 1;
	} catch (err) {
	  console.error(err);
	} 
  
	username += String(occurrence).padStart(3, '0');
	console.log(username);
	return username;
  }	


});

//DELETE user based on username
router.delete('/delete-user/:username', async (req, res) => 
{

	try {
		const username = req.params.username;
	
		// Connect to the MongoDB cluster
		await client.connect();
	
		// Access the "users" database and "Backend_Intern" collection
		const collection = client.db("Users").collection("User_details");
	
		// Delete the user
		const result = await collection.findOneAndDelete({ username });
	
		if (!result.value) {
		  return res.json({ error: 'User not found.' });
		}
		
		const user = result.value;
		user.success = "user successfully deleted"; 
		console.log("user successfully deleted\n");
		res.send(user);
	  } catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal Server Error' });
	  } finally {
		// Close the MongoDB client connection
		await client.close();
	  }
	
});

//PUT to edit user details
router.put('/edit-user', async (req, res) => 
{
	try {
		const editUser = req.body;
	
		if (!editUser || !editUser.firstName || !editUser.lastName || !editUser.email || !editUser.role || !editUser.username || !editUser.id) {
		  console.log("Fields empty or incomplete");
		  return res.status(500).json({ error: 'Fields empty or incomplete.' });
		}
	
		// Connect to the MongoDB cluster
		await client.connect();
	
		// Access the "users" database and "Backend_Intern" collection
		const collection = client.db("Users").collection("User_details");
	
		// Find the user to update
		const filter = { username: editUser.username, id: editUser.id };
		const update = { $set: editUser };
		const options = { returnOriginal: false };
		const result = await collection.findOneAndUpdate(filter, update, options);
	
		if (!result.value) {
		  return res.json({ error: 'User not found.' });
		}
	
		res.json(editUser);
	  } catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Internal Server Error' });
	  } finally {
		// Close the MongoDB client connection
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