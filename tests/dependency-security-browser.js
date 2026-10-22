// Run after loading the locked DOMPurify UMD distribution in an isolated blank browser tab.
(() => {
  const purifier = globalThis.DOMPurify
  const document = globalThis.document
  const results = []
  for (const hook of ['beforeSanitizeElements', 'uponSanitizeElement', 'afterSanitizeElements', 'afterSanitizeAttributes']) {
    purifier.removeAllHooks()
    const root = document.createElement('div')
    root.innerHTML = '<section id="dependency-security-wrap"><img onerror="globalThis.dependencySecurityXSS=true"></section>'
    document.body.append(root)
    const image = root.querySelector('img')
    purifier.addHook(hook, node => {
      if (node.id === 'dependency-security-wrap') node.remove()
    })
    purifier.sanitize(root, { IN_PLACE: true })
    results.push({ hook, detached: !root.querySelector('section'), safe: !image.hasAttribute('onerror') })
    root.remove()
  }
  purifier.removeAllHooks()
  const root = document.createElement('style')
  root.textContent = '</style><img onerror="globalThis.dependencySecurityXSS=true">'
  document.body.append(root)
  try {
    const returned = purifier.sanitize(root, { IN_PLACE: true })
    const probe = document.createElement('div')
    probe.innerHTML = returned.outerHTML || ''
    results.push({ rawtextRoot: true, safe: !probe.querySelector('[onerror]') })
  } catch (error) {
    results.push({ rawtextRoot: true, safe: error instanceof TypeError, rejected: error.name })
  } finally {
    root.remove()
  }
  const legitimate = purifier.sanitize('<p>Hello <strong>Roomchang</strong><img onerror="unsafe()"></p>')
  results.push({ legitimate: true, safe: legitimate === '<p>Hello <strong>Roomchang</strong><img></p>' })
  return { version: purifier.version, passed: results.every(result => result.safe), results }
})()
