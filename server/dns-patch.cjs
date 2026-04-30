const dns = require('dns')

// Resolved via Google DNS — bypasses local DNS that refuses neon.tech lookups
const KNOWN = {
  'ep-dark-bonus-ankavv8r.c-6.us-east-1.aws.neon.tech': '3.227.221.118',
}

const orig = dns.lookup.bind(dns)
dns.lookup = function (hostname, opts, cb) {
  if (typeof opts === 'function') { cb = opts; opts = {} }
  const ip = KNOWN[hostname]
  if (ip) {
    const all = typeof opts === 'object' && opts.all
    if (all) cb(null, [{ address: ip, family: 4 }])
    else cb(null, ip, 4)
  } else {
    orig(hostname, opts, cb)
  }
}
