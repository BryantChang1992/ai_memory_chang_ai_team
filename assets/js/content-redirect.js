const destination = document.getElementById('content-destination');
if (destination) {
  const target = new URL(destination.href);
  if (!target.hash && window.location.hash) target.hash = window.location.hash;
  window.location.replace(target.href);
}
