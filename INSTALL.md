# Installation

## Build Environment

This app uses the [Create-React-App](https://github.com/facebook/create-react-app) buildsystem to create the app with one command.

First, you have to build the necessary environment on your system. With `npm` just run

`npm install`

## Run Testserver

With `npm start` you start a testserver. The `.env.development` file is used for settings if present.

## Build Production App (Standalone)

`npm run build-bundle` 

This will produce the following files:

```
  171.7 KB  build/static/js/2.ee67c4ac.chunk.js
  10.13 KB  build/static/js/main.75a149e7.chunk.js
  2.24 KB   build/static/css/main.a3d303c9.chunk.css
  1.17 KB   build/static/css/2.5b0239b1.chunk.css
  803 B     build/static/js/runtime~main.b4bc85ef.js
```

## Build Production Bundle for TYPO3

`npm run build-bundle`

This will produce the following files:

* `build/static/css/main.*.css`
* `build/static/js/main.*.js`

These files can be embedded into a HTML-Page like this:

```
<!doctype html>
<html lang="en">
   <head>
      <link href="/static/css/main.0bd96208.css" rel="stylesheet">
   </head>
   <body>
      <div id="root"></div>
      <script src="/static/js/main.b05fec78.js"></script>
   </body>
</html>
```

To embedd these files into a TYPO3 sitepackage, you have to copy the Media, Js and CSS-directories to e.g. `your_sitepackage/Resources/Public/GeoSearch/`.

In the `package.json` you have to adapt the `homepage` field to this path.
