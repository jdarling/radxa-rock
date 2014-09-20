Plugger
=======

Status: Soft custard - the basics are worked out but not everything is working, things will probably change.

Because writing a modular plugin system sucks.

Let's face it, you want to write some sooper cool uber application that allows your users to register modules, plugins, whatever...  At first, this seems like a really simple thing to do, so you try one of the obvious:

    * Read in a list of modules from a config file and load them, easy, simple, fast
    * Read a directory containing a listing of all of the plugins and load them

This works for a while, but then "Plugin A" requires that "Plugin B" be loaded first.  Problem is, the user didn't install "Plugin B", or they installed it but as a NPM module.  If your using a configuration array this isn't too bad, just move things around.  If your using the load from folders, then suggest that your users use some archaic naming convention.

This works again for a while, but again your users do something they shouldn't.  Say load two different conflicting libraries that do user validation.  Now, everything breaks yet again.  Sure, you could just tell everyone to name their modules something like "Security" but no one really likes naming conventions.

Plugger aims to alleviate all of these headaches by introducing a common and simple plugin loading system that supports loading of plugins from a folder, from a configuration array, and takes care of conflicting libraries based on priority, roles and/or names.

The Plugin
-------------

```
Plugin: {
  version: '0.0.0', // Semver, required
  priority: -1, // An optional priority
  requires: [ // Optional list of requirements to meet
    'someOtherModule', // Require by name
    'anotherModule@version', // Require by name and version
    {type: 'storage'}, // Require by type
    {role: "storage engine'} // Require by role
  ],
  type: 'security', // Optional type
  role: 'authentication', // Optional role
  unique: { // Optionally make it unique
    type: true, // by type
    role: true // and/or by role
  },
  description: 'Optional description of the plugin',
  plugin: Object||Array||function(){
    // Whatever you want or need
  }
}
```

NOTE: Types and Roles are not implemented yet.  May have to move to a fetch then load scenario to allow for these.

What Plugger is NOT
-------------------

Plugger will not actually do anything with the plugins it loads for you.  It will simply load them and make them available for you to then utilize.  You will still need to walk the plugins and tie them back to your application.  See the examples for more information.

Plugger also will not stop your application from loading when it finds an error.  It simply marks the plugin as in error, attaches the errors to the plugin details, and moves on.  The errors are also returned in the loaded callback.

Options
---------

```
Defaults: {
  path: 'plugins',
  defaultPriority: 0
};
```

What's done
-----------

Currently Plugger can load plugins from an array or a directory and will load in any required plugins as well.

How it works
---------------------

API
===

load(callback)
----------------

callback(errors, packages)

load(library, callback)
--------------------------

callback(errors, packages)

load([library, library, ...] callback)
---------------------------------------

callback(errors, packages)

safe(library, callback)
-------------------------

callback(errors, isSafe)

prepare(callback)
---------------------

callback(errors, packages)

Example
=======

```
var Plugger = require('plugger').Plugger;

var plugger = new Plugger({
  path: path.resolve('./', 'plugins')
});

plugger.load(function(errs, plugins){
  if(errs && !plugins){
    console.log(errs);
    process.exit(1);
  }
  console.log('Loaded plugins:');
  plugins.forEach(function(plugin){
    console.log(plugin);
  });
  console.log('All plugins are ready for you to do something with');
});
```
