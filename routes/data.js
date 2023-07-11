//Call libraries/dependencies
const express = require('express');
const router = express.Router();
const fs = require('fs'); //Allows work with file systems
const path = require('path');
const filepath = path.join(__dirname, './data.json');
const uuid = require('uuid');
const consonantsRegex = /[bcdfghjklmnpqrstvwxyz]/i; //Match consonants in last name

//GET all users available in the JSON
router.get('/get-user', (req, res) =>
{
	try
	{
		fs.readFile(filepath, 'utf8', (err, data) => {
			if (err)
			{
				console.error(err);
				res.status(500).json({ error: 'Failed to read json file' });
				return;
			}

			try
			{
				const jsonArray = JSON.parse(data); //Parse JSON data into an array
				res.send(jsonArray); //Return the array as the response
			}
			catch (readError)
			{
				console.error(readError);
				res.status(500).json({ error: 'Failed to read json file' });
			}
		});
	}
	catch (readError)
	{
		console.error(readError);
		res.status(500).json({ error: 'Internal server error' });
	}
});

//GET a user based on the username of the user
router.get('/get-user/:username', (req, res) =>
{
	const username = req.params.username;

	fs.readFile(filepath, 'utf8', (err, data) =>
	{
		if (err)
		{
			console.error(err);
			return res.status(500).json({ error: 'Failed to read json file.' });
		}

		const result = JSON.parse(data);
		//Search for username
		console.log(result[0].username);
		const returnUser = result.find(user => user.username === username);
		if (!returnUser)
		{
			return res.status(404).json({ error: 'User not found.' });
		}

		res.json(returnUser);
	});
});

//POST a new user to the json
router.post('/add-user', (req, res) =>
{
	const newUser = req.body;

	if (!newUser ||
		!newUser.firstName ||
		!newUser.lastName ||
		!newUser.email ||
		!newUser.role)
	{
		console.log("Fields empty or incomplete");
		return res.status(500).json({ error: 'Fields empty or incomplete.' });
	}

	fs.readFile(filepath, 'utf8', (err, data) =>
	{
		if (err)
		{
			console.error(err);
			return res.status(500).json({ error: 'Failed to read JSON file.' });
		}

		const users = JSON.parse(data) || [];

		//Generate username
		const usernamePrefix = newUser.firstName.substring(0, 3).toLowerCase();
		const lastNameConsonants = newUser.lastName.match(consonantsRegex);
		const usernameSuffix = lastNameConsonants ? lastNameConsonants.slice(0, 3).join('').toLowerCase() : 'xxx';

		//Count existing usernames with the same prefix and suffix
		let usernameCount = 0;
		const existingUsernames = users.filter(user => user.username && user.username.startsWith(usernamePrefix + usernameSuffix));
		if (existingUsernames.length > 0)
		{
			usernameCount = existingUsernames.length;
		}

		//Generate username digits based on the count
		const usernameDigits = String(usernameCount + 1).padStart(3, '0'); //Count the number of existing identical usernames

		//Assign username and ID to the new user
		newUser.username = usernamePrefix + usernameSuffix + usernameDigits; //Concatenate to create the username
		newUser.id = uuid.v4(); //Randomly generate id field

		//Add the new user to the array
		users.push(newUser);

		fs.writeFile(filepath, JSON.stringify(users), 'utf8', (err) =>
		{
			if (err)
			{
				console.error(err);
				return res.status(500).json({ error: 'Failed to write JSON file.' });
			}
		
			res.json(users); //Send the updated user array as the response
		});
	});
});

//DELETE user based on username
router.delete('/delete-user/:username', (req, res) =>
{
	const username = req.params.username; //Extracts username from request URL

	// Read the JSON file to get the list of users
	fs.readFile(filepath, 'utf8', (err, data) =>
	{
		if (err)
		{
			console.error(err);
			return res.status(500).json({ error: 'Failed to read JSON file.' });
		}

		let users = JSON.parse(data) || [];

		// Find the user with the matching username
		const userIndex = users.findIndex(user => user.username === username);
		if (userIndex === -1)
		{
			return res.status(404).json({ error: 'User not found.' });
		}

		// Remove the user from the array
		const deletedUser = users.splice(userIndex, 1)[0];

		// Write the updated user list back to the JSON file
		fs.writeFile(filepath, JSON.stringify(users), 'utf8', (err) =>
		{
			if (err)
			{
				console.error(err);
				return res.status(500).json({ error: 'Failed to write JSON file.' });
			}

			res.json({ message: 'User deleted successfully.', user: deletedUser });
		});
	});
});

//PUT to edit user details
router.put('/edit-user', (req, res) =>
{
	const updatedUser = req.body; //Extracts user data from request URL

	// Validate that all fields are populated
	if (
		!updatedUser ||
		!updatedUser.firstName ||
		!updatedUser.lastName ||
		!updatedUser.email ||
		!updatedUser.role
	)
	{
		console.log("Fields empty or incomplete");
		return res.status(400).json({ error: 'Fields empty or incomplete.' });
	}

	// Read the JSON file to get the list of users
	fs.readFile(filepath, 'utf8', (err, data) =>
	{
		if (err)
		{
			console.error(err);
			return res.status(500).json({ error: 'Failed to read JSON file.' });
		}

		let users = JSON.parse(data) || [];

		// Find the user with the matching ID
		const userIndex = users.findIndex(user => user.id === updatedUser.id);
		if (userIndex === -1)
		{
			return res.status(404).json({ error: 'User not found.' });
		}

		// Preserve the existing ID and username
		const { id, username } = users[userIndex];

		// Update the user details, excluding ID and username
		users[userIndex] =
		{
			id,
			username,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
			email: updatedUser.email,
			role: updatedUser.role,
		};

		// Write the updated user list back to the JSON file
		fs.writeFile(filepath, JSON.stringify(users), 'utf8', (err) =>
		{
			if (err)
			{
				console.error(err);
				return res.status(500).json({ error: 'Failed to write JSON file.' });
			}

			res.json(users[userIndex]);
		});
	});
});

//Middleware sends data to server.js
module.exports = router;