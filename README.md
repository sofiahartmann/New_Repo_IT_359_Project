# IT-359-Group-Project
We are going to use a XSS attack on an intentionally vulnerable site to then send information to a chat bot and have it suggest to developers what can be done to resolve the vulnerable site.

## Team Members
- Laney Dunker
- Sofia Hartman

## Full Project Idea
This project demonstrates a basic Cross-Site Scripting (XSS) vulnerability in a web application and integrates Artificial Intelligence to automatically explain the vulnerability and suggest secure fixes. The system allows a user to input data into a deliberately vulnerable web page. When a malicious script executes, the application sends details of the input and behavior to an AI model, which then generates a human-readable explanation of what type of XSS occurred, why it happened and how developers can fix it.

We will be using one intentionally vulnerable web page to demonstrate with, AI to generate explanations and common XSS payloads to test in our web page. We will be using an html web page and javaScript to make our webpage, and the School of IT's AI bot to generate the responses. 

## Timeline
- Week 1-3: Create our html page and make sure that it is vulnerable to XSS. Begin research on common XSS payloads.
- Week 4-6: Test the XSS payloads to make sure that they work with our page, begin research on proper AI prompt to get the information that we need
- Week 7-9: Implement the ai explanation and suggested fixes, and attempt implementing the suggestions into our site to see if we can fix them.
- Week 10-12: Test all features from start to finish, create final project documents and demonstrations if neccesary.
