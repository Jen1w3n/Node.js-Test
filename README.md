# Node.js-Test
Node.js program for backend internship application.

Project Description
-----------------------------
This NodeJS project handles the backend user management of an application.
Users can be added to the application, searched for based on username, deleted, or edited and all users can be displayed in an array. The code for this application is publicly stored in a GitHub repository and hosted on Glitch. The link provided to see the application in Glitch opens on the '/get-users' endpoint.

Installation
-----------------
Repository link: https://github.com/Jen1w3n/Node.js-Test
Glitch hosting site link: https://northern-plant-quality.glitch.me/get-users
The code for the project was written in Javascript using the VS Code IDE, and is linked to a MongoDB Atlas database in which the user data is stored. The different commands can be tested using an application such as Postman.
The application can be started in the command console with nodemon, express, and uuid.

Usage
---------
The project has five endpoints that can be tested in Postman or displayed using Glitch. 
The following endpoints can be checked in Postman with the corresponding links: 
	/add-user : https://northern-plant-quality.glitch.me/add-user
	/delete-user/{username} : https://northern-plant-quality.glitch.me/delete-user/{username}
	/edit-user : https://northern-plant-quality.glitch.me/edit-user/{username}
The following endpoints can be checked in Postman or on Glitch with the corresponding links:
	/get-user/{username} : https://northern-plant-quality.glitch.me/get-user/{username}
	/get-users : https://northern-plant-quality.glitch.me/get-users

Features
-------------
/add-user - To reach this endpoint using Postman, one can use the /add-user link as stated under Usage and include the new user data in the body using a POST request.
/delete-user/{username} : To reach this endpoint using Postman, one can use the link as stated under Usage and include the username of the user to be deleted in place of {username} using a DELETE request.
/edit-user - To reach this endpoint using Postman, one can use the link as stated under Usage and include the username in place of {username}. The new data can be included in the body with a PUT request.
/get-user/{username} - To reach this endpoint using Postman or Glitch, one can use the link as stated under Usage and include the username in place of {username}. In Postman, one would need to spceify this as a GET request.
/get-users - To reach this endpoint using Postman or Glitch, one can use the link as stated under Usage to display all users in the database. In Postman, one would need to specify this as a GET request.
