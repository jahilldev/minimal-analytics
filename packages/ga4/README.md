# @minimal-analytics/ga4

This package is a slimmed down (**1KB GZipped**), drop-in replacement for the official Google Analytics 4 library. It provides page view tracking, engagement time and scroll events. Custom events can be handled in your application by calling `track` with your custom event type when needed.

The package works by calling the Google Analytics API directly, no further integrations like GTM are required.

This is intended for those who want to minimize the impact of third-party JavaScript, while maintaining essential analytics tracking. If you require more advanced tracking (AdWords, etc), it's recommended to use the official library instead.

# Getting Started

**N.B.** The instructions below assume a Node environment is available. If you're not running or building your application in a Node environment, jump to the [CDN section](#cdn).

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

track('GX-XXXXX');
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
    trackingId: 'GX-XXXXX',
  };
</script>
```

## Events

The default event type of `page_view` can be overriden by providing the relevant argument to the `track` function. The interface for this [can be found here](https://github.com/jahilldev/minimal-analytics/blob/main/packages/ga4/src/index.ts#L24).

```ts
// "type" and "event" can contain anything
track({ type: 'user_signup', event: { 'user.id': 12345 });
```

## Onload

If you'd prefer to let the `ga4` script initialise tracking itself when loaded, you can define the following property on the window, prior to including the script on the page:

```js
window.minimalAnalytics = {
  trackingId: 'GX-XXXXX',
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

If you're not running or building your application in a Node environment, you can make use of the following CDN to include the script on your page:

https://unpkg.com/@minimal-analytics/ga4/dist/index.js

Alternatively, you can download the script from the link above and host it yourself.

You must enable `autoTrack` to use `ga4` in this way, see [Onload](#onload) for further instructions.

# Acknowledgement

This package builds on the great work done by [David Künnen](https://github.com/DavidKuennen) and [Dariusz Więckiewicz](https://github.com/idarek). David's work on the small drop in replacement for Universal Analytics, and Dariusz's port over to GA4 were instrumental in providing a blue print for `@minimal-analytics/ga4`.
