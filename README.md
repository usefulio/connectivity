Connectivity
==============
Detects a slow Meteor connection.

## Quick use
**Step 1.** Add the `Connectivity` package to your meteor app

```
meteor add useful:connectivity
```

**Step 2.** Use the `monitor` method in your `client` code:

```javascript
Connectivity.monitor({
  'onSlowConnection': function () {
    console.warn('This connection is slow!');
  }
});
```

## API

### `Connectivity.monitor([callbacks], [options])`
Starts monitoring the connection.

- `callbacks` an optional object containing callback methods. Used to override the built-in `onError` and `onSlowConnection` callback methods. Each of the methods is optional. Example:
```js
Connectivity.monitor({
  'onError': function (error) {
    console.warn('Error: ' + error);
  }
  , 'onSlowConnection': function () {
    console.log('This connection is slow!');
  }
});
```

- `options` an optional object containing custom configuration options. 

	- `maxLatency` an integer representing the maximum accepted latency value (in miliseconds) before considering a connection "slow". Defaults to `2000`.
	- `retryInterval` an integer representing how much time (in miliseconds) should pass between pings. Defaults to `5000`. Example:
```js
Connectivity.monitor({}, {
    retryInterval: 700
    , maxLatency: 150
});
```

-----------------------------------
### `Connectivity.isSlow()`
Reactively shows if the connection is slow. Example:

*someTemplate.js:*
```js
Connectivity.monitor();

Template.SomeTemplate.helpers({
  isSlow: function () {
    return Connectivity.isSlow();
  }
});
```
*someTemplate.html:*
```html
...
{{#if isSlow}}
  The connection is slow!
{{else}}
  All systems go!
{{/if}}
...
```
-----------------------------------
### `Connectivity.latency()`
Reactively returns the most recent latency value. Example:

*someTemplate.js*
```js
Connectivity.monitor();

Template.SomeTemplate.helpers({
  latency: function () {
    return Connectivity.latency();
  }
});
```
*someTemplate.html:*
```html
...
<p>The current latency is {{latency}}</p>
...
```
-----------------------------------
### `Connectivity.strength()`
Reactively returns the connection strength. 

- `0` - no connection
- `1` - slow connection
- `2` - good connection

Example - use `Connectivity.strength()` to create a simple phone-style signal indicator:

*signal.js:*
```js
Connectivity.monitor({}, {
    maxLatency: 1000
});

Template.Signal.helpers({
  bars: function () {
    var bars = []
      , minHeight = 1
      , heightMultiplier = 10
      , maxStrength = 2; // maximum value for Connectivity.strength()
    for (var i = 0; i <= maxStrength; i++) {
      var height = (i > Connectivity.strength()) ? minHeight : minHeight + i * heightMultiplier;
      bars.push({
        height: height
        , marginTop: maxStrength * heightMultiplier + minHeight - height
      });
    }
    return bars;
  }
});
```
*signal.html:*
```html
<template name="Signal">
  {{#each bars}}
    <div class="bar" style="height:{{height}}px; margin-top:{{marginTop}}px"></div>
  {{/each}}
</template>
```
*signal.css:*
```css
.bar {
	background-color: #888;
	float: left;
	margin: 1px;
	width: 18px;
}
```
-----------------------------------
