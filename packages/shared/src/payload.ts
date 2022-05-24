/* -----------------------------------
 *
 * Document
 *
 * -------------------------------- */

function getDocumentMeta() {
  const title = document.title;
  const hostname = document.location.hostname;
  const origin = document.location.origin;
  const pathname = document.location.pathname;
  const search = document.location.search;
  const referrer = document.referrer;

  return { location: origin + pathname + search, hostname, referrer, title };
}

/* -----------------------------------
 *
 * Export
 *
 * -------------------------------- */

export { getDocumentMeta };
