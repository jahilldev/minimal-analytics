# @minimal-analytics/ga4

[![CI](https://github.com/jahilldev/minimal-analytics/actions/workflows/ci.yml/badge.svg?)](https://github.com/jahilldev/minimal-analytics/actions/workflows/ci.yml)

This package is a slimmed down (**2KB GZipped**), drop-in replacement for the official Google Analytics 4 library. It provides **page view**, **engagement time**, **scroll**, **file download** and **click tracking** events. Custom events can be handled in your application by calling `track` with your custom event type when needed.

The package works by calling the Google Analytics API directly, no further integrations like GTM are required.

This is intended for those who want to minimize the impact of third-party JavaScript, while maintaining essential analytics tracking. If you require more advanced tracking (AdWords, etc), it's recommended to use the official library instead.

At present, the following enhanced measurement events are supported:

![Enhanced Measurement](https://github.com/jahilldev/minimal-analytics/blob/main/assets/ga4-support.jpg?raw=true)

# Getting Started

**N.B.** The instructions below assume a Node environment is available. If you're not running or building your application in Node, jump to the [CDN section](#cdn).

Install with Yarn:

```bash
$ yarn add @minimal-analytics/ga4
```

Install with NPM:

```bash
$ npm i @minimal-analytics/ga4
```

# Usage

This package exports one function, `track`. This is used to trigger an event passed to Google Analytics. By default, calling `track` will trigger a `page_view` event type, although this can be overriden.

In your application, call `track` as early as possible to ensure your page view is recorded quickly. For example:

```js
import { track } from '@minimal-analytics/ga4';

/*[...]*/

track('G-XXXXXXXXXX');
```

## Arguments

The `track` function can be called in the following ways, for example:

```ts
function track(trackingId: string, props?: IProps);
function track(props?: IProps);
```

To call `track` without a tracking ID, it must be defined on the window via `trackingId`, e.g:

```html
<script>
  window.minimalAnalytics = {
    trackingId: 'G-XXXXXXXXXX',
  };
</script>
```

## Events

The default event type of `page_view` can be overriden by providing the relevant argument to the `track` function. The interface for this [can be found here](https://github.com/jahilldev/minimal-analytics/blob/main/packages/ga4/src/index.ts#L24).

```ts
// "type" and "event" can contain anything
track({ type: 'user_signup', event: { 'epn.user_id': 12345, 'ep.user_name': 'John', });
```

**Note**: It's generally best practice (or advised) to prefix any `event` properties with `ep.` or `epn.` to ensure there are no future conflicts with official GA4 parameters. If you require GA4 to parse a parameter as a number, use the prefix `epn.`, if not, use `ep.` at the start of your object key.

### Download

Download tracking happens automatically based on whether or not an anchor's `href` or `download` attribute contains a supported file URL (see list [here](https://github.com/jahilldev/minimal-analytics/blob/main/packages/ga4/src/model.ts#L36)). If you provide downloads that are not accessible by the client, for example, behind a form submission or CSRF based system, you can apply a `download` attribute with a value of a valid link url to trigger the event.

For example, all of these will trigger a GA4 download event:

```html
<a href="https://download.com/file.pdf">Download</a>
<a href="https://download.com/file.pdf" download>Download</a>
<button download="https://download.com/file.pdf">Download</button>
<input type="submit" download="https://download.com/file.pdf" value="Download" />
<input type="button" download="https://download.com/file.pdf" value="Download" />
```

## Global

If you'd like the `track` function to be defined on the Window, e.g `window.track()`, you'll need to define the following property prior to loading the `@minimal-analytics/ga4` package, or script:

```js
window.minimalAnalytics = {
  defineGlobal: true,
};
```

This will allow you to access the `track` function throughout your application.

## Onload

If you'd prefer to let the `ga4` script initialise tracking itself when loaded, you can define the following property on the window, prior to including the script on the page:

```js
window.minimalAnalytics = {
  trackingId: 'G-XXXXXXXXXX',
  autoTrack: true, // <-- init tracking
};
```

Once the `ga4` script has loaded, `track` will automatically be called with the tracking ID defined above. You _must_ ensure both `trackingId` and `autoTrack` are properly defined for this to work.

## Endpoint

If you need to define your own collection endpoint, to proxy or record values yourself, you can use the following property:

```js
window.minimalAnalytics = {
  analyticsEndpoint: '/collect', // <-- your endpoint
};
```

This value will supercede the default Google Analytics endpoint if defined.

# CDN

If you're not running or building your application in a Node environment, you can use one of the following CDN's to include the script on your page:

- https://unpkg.com/@minimal-analytics/ga4/dist/index.js
- https://cdn.jsdelivr.net/npm/@minimal-analytics/ga4/dist/index.js

Alternatively, you can download the script from any of the links above and host it yourself.

You must enable `autoTrack` to use `ga4` in this way, see [Onload](#onload) for further instructions.

# Acknowledgement

This package builds on the great work done by [David Künnen](https://github.com/DavidKuennen) and [Dariusz Więckiewicz](https://github.com/idarek). David's work on the small drop in replacement for Universal Analytics, and Dariusz's port over to GA4 were instrumental in providing a blue print for `@minimal-analytics/ga4`.

# Integration
## Integration with Hugo

[Hugo](https://gohugo.io/) is one of the most popular open-source static site generators. Here's how to [integrate minimal analytics within Hugo]([https://discourse.gohugo.io/t/add-minimal-analytics-google-analytics-v4-to-hugo/39016](https://discourse.gohugo.io/t/add-minimal-analytics-google-analytics-v4-to-hugo/39016).
