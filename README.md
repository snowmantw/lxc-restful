# RESTful APIs for LXC

## How to install

1. Git clone the repo in your local directory
2. `npm install` in the repo directory

## How to run

1. Change to root via `sudo -s` or other commands.
2. Enter the directory and type

    node ./server.js

### Test it under the browser

1. Open your browser with `http://127.0.0.1:3000`
2. Open your browser' consol and use embedded jQuery to send RESTful request to the server, like

    // Create new container.
    $.post('/container', {'id': "TestContiner"})

    // Delete the container.
    $.ajax({
        url: '/container/TestContainer',
        type: 'DELETE',
        success: function(result) {
            // Do something with the result
        }
    }) 


