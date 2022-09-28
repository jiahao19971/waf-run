# waf-run

## Description
This is a repo created to test api requests to an endpoint per minute.
The environment allow to set the amount of requests to send per minute and how long the request should run.

## Setup

### Install all the dependencies
```
npm install or yarn install
```

### Create a .env in local directory
```
URL=<url you want the request is sending to, make sure to include http or https>
HOW_LONG_IN_MINUTES=<the duration of the request in minutes>
NUMBER_OF_REQUEST=<the frequency in a minute>
```

### Run the package
```
npm start or yarn start
```


