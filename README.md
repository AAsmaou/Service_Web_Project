
# Rivescript chatbot in NodeJS running on the Browser and Discord

In this project me and Aasmaou have realized a simple chatbot based on Rivescript that can run on the browser or Discord.

The project consists of web-app which is composed of two interfaces:

	1. ADMIN PAGE: which lets you
		- launch the chatbot by selecting the platform (Broser or Discord), the name of the chatbot and the brain. 
		- Update the rivescript-brain keeping the chat (without refresching the page)
		- Disconnect the bot from Discord
		- See the status of all the bots
		- Follow the conversation the bot is having with the user

	2. CHATROOM: is the page where the chat is helding. 
	


## FEATURE

1. The bot can learn the name, nickname, age and location of the user. Some of this information are stored in a MongoDB database and hence shared among all the other bots running on the Browser.
    N.B. In our work we could experience that this feature is not working for Discord although the code is the same for the two platform. (the part of the code that is storing the information
    about the user is placed in the standard.rive file ( the brain of the chatbot ). 
    It might be caused by a bad connection, since in carrying out this work we could observe that sometimes our pages stucked because of the slow connection. 

2. You can select the name of the chatbot to run. 
    N.B. This option is actually reliable only for running the bot on the Browser, since we could experience an error running for instance Alice on Discord, since the name Alice already
    existed as botname on the platform. 
    


## PACKAGE USED

1. _Socket.io_ for sending the messages from client to server ( chatroom ) and from server to server ( broadcast the messages to the admin page ).

2. _MongoDb_ for implementing the mongoDB database.

3. _Discord.js _for interfacing with Discord API.

4. _Rivescript_ for emulating the bot.

5. _Method-override_ for exploiting the delete and put method by overriding the post and get method of the form

6. _Express_

7. _Cors_ for allowing the exchange of messages between the ServerBot.js and the ServerAdmin.js
