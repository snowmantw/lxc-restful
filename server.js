
// Dirty db for dirty hack.
var Dirtle = require('dirtle')
var DBPATH = 'db.json'

var uuid=require('node-uuid')
var path = require('path')
var ejs = require('ejs')
var express = require('express')
var app = express()
var http = require('http')
var server = http.createServer(app)
var ws = new (require('websocket').server)({httpServer: server})

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};

app.configure(function()
{
    app.set('views', __dirname+'/template');
    app.set("view options",{layout:false});
    app.use(allowCrossDomain)
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use('/library',express.static( __dirname + '/library'));
    app.use('/build',express.static( __dirname + '/build'));
    app.use('/media',express.static( __dirname + '/media'));
    app.use('/style',express.static( __dirname + '/style'));
    app.use(app.router);
});

app.all('/*', function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
//      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      next();
});

/*
    GET:    
            /container/[ID]    -- Get information about the container.
            /container         -- List all container.
            /cluster/[ID]      -- Get information about the cluster.
            /cluster           -- List all cluster. 
    POST:   
            /container         -- Create new container; return the container's URL.
            /cluster           -- Create new cluster according to the form; return the cluster's URL .
            /cluster/[ID]      -- Create a new container in a cluster; return the container's URL.
    PUT:
            /container         -- Update or create (if not exist yet) all container.
            /cluster           -- Update or create (if not exist yet) all cluster.
            /container/[ID]    -- Update or create (if not exist yet) a container.
            /cluster/[ID]      -- Update or create (if not exist yet) a cluster.
    DELETE:
            /container         -- Delete all container. 
            /cluster           -- Delete all cluster. 
            /container/[ID]    -- Delete a container, include all bounded resources.
            /cluster/[ID]      -- Delete a cluster, include sub containers all bounded resources.

*/

app.get('/', function(req,res){
    res.render('index.ejs')
});

app.get('/container/:id',function(req,res){
    var id = req.params.id

    var db = new Dirtle(path.join(__dirname, DBPATH )).db;
    var container = db.container

    res.writeHead(200, {'Content-Type': 'text/json'})
    res.end(JSON.stringify(container[id]))
});

app.get('/container', function(req,res){
    var db = new Dirtle(path.join(__dirname, DBPATH )).db;
    var container = db.container

    res.writeHead(200, {'Content-Type': 'text/json'})
    res.end(JSON.stringify(container))
});

/* User can provide id, or it return UUID one. */
app.post('/container',function(req, res){
    var container = req.body
    var id = req.body.id
    if(id == ""){ id = uuid.v4() }
    container.id = id

    // Do lxc create works.
    var spawn = require('child_process').spawn
    var lxc_create = spawn('lxc-create',['-t','ubuntu-cloud','-n',id])

    // TODO: Parsing form and setting configs, include modifying setting files.

    lxc_create.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });

    lxc_create.stderr.on('data', function (data) {
        console.log('stderr: ' + data);

    });

    lxc_create.on('exit', function(code){

        if( 0 == code )
        {
            var db = new Dirtle(path.join(__dirname, DBPATH )).db;
            db.container[id] = container

            res.writeHead(200, {'Content-Type': 'text/json'})
            res.end(JSON.stringify("/container/"+id))

            console.log("[DEBUG] LXC had been created: "+id)
        }
        else
        {
            res.writeHead(500, {'Content-Type': 'text/json'})
            res.end(JSON.stringify({'error': "/container/"+id}))
        }
    })

});

app.delete('/container/:id', function(req, res){
    var id = req.params.id

    console.log('[DEBUG] ID deleted: '+id+' , db: '+JSON.stringify(db.container))

    // Do lxc create works.
    var spawn = require('child_process').spawn
    var lxc_destroy = spawn('lxc-destroy',['-n',id])

    // TODO: Parsing form and setting configs, include modifying setting files.

    lxc_destroy.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    lxc_destroy.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    lxc_delete.on('exit', function(code){
        if(0 == code)
        {
            console.log('stdout: ' + data);
            var db = new Dirtle(path.join(__dirname, DBPATH )).db;
            db.container[id] = null
            delete db.container[id]

            res.writeHead(200, {'Content-Type': 'text/json'})
            res.end(JSON.stringify(""))

            console.log("[DEBUG] LXC had been destroyed: "+id)
        }
        else
        {
            res.writeHead(500, {'Content-Type': 'text/json'})
            res.end(JSON.stringify({'error': "/container/"+id}))
        }
    })

});


ws.on
(   'request'
,   function(req)
{   var connection = req.accept(null, req.origin)
    console.log('req',req)

    // another event in
    connection.on
    (   'message'
    ,   function(data)
    {
        console.log('[DEBUG] test data: ', data)
    }
    )
}
)

server.listen(3000);
