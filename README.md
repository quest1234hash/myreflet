# myreflet
npm i and run at localhost or create a vhost and proxy it to localhost:port at which project is running with x-forwarded-for property in server config.
always check whether it is 'X-Forwarded-For' or 'x-forwarded-for' in './app/controllers/front/user.js', either of them will work.
