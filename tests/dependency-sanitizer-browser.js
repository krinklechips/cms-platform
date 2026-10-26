// Run with the actual Monaco-resolved DOMPurify UMD build in an isolated browser profile.
(() => {
  const results = []
  const check = (name, safe) => results.push({ name, safe })
  const purifier = globalThis.DOMPurify
  const document = globalThis.document

  for (const [dialect, fragments] of [
    ['mustache', ['{', '{', '7*7', '}', '}']],
    ['template-literal', ['$', '{7*7}']],
    ['erb', ['<', '%', '=7*7', '%', '>']],
  ]) {
    for (const nested of [false, true]) {
      const host = document.createElement('div')
      const shadow = host.attachShadow({ mode: 'open' })
      const target = nested ? shadow.appendChild(document.createElement('div')).attachShadow({ mode: 'open' }) : shadow
      fragments.forEach((fragment, i) => {
        if (i) target.appendChild(document.createElement('object'))
        target.appendChild(document.createTextNode(fragment))
      })
      document.body.append(host)
      purifier.sanitize(host, { IN_PLACE: true, SAFE_FOR_TEMPLATES: true })
      target.normalize()
      check(`shadow ${dialect} nested=${nested}`, !/\{\{|\$\{|<%/.test(target.textContent))
      host.remove()
    }
  }

  for (const hook of ['beforeSanitizeElements', 'uponSanitizeElement', 'afterSanitizeElements', 'beforeSanitizeAttributes', 'afterSanitizeAttributes']) {
    for (const mode of ['parent', 'nextSibling']) {
      purifier.removeAllHooks()
      const root = document.createElement('div')
      root.innerHTML = '<figure><img class="bad"><img id="evil" onerror="globalThis.dependencySecurityXSS=true"></figure><p>ok</p>'
      const evil = root.querySelector('#evil')
      document.body.append(root)
      purifier.addHook(hook, node => {
        if (node.getAttribute?.('class') === 'bad') {
          if (mode === 'parent') node.parentNode.remove()
          else node.nextElementSibling?.remove()
        }
      })
      purifier.sanitize(root, { IN_PLACE: true })
      check(`${hook} ${mode}`, !evil.hasAttribute('onerror') && !root.contains(evil))
      check(`${hook} ${mode} normal output`, root.querySelector('p')?.textContent === 'ok')
      root.remove()
    }
  }
  purifier.removeAllHooks()

  const smil = '<svg xmlns="http://www.w3.org/2000/svg"><a><animate attributeName="href" values="x;javascript:alert(1)" dur="0.01s" fill="freeze"/><text>Care</text></a></svg>'
  const cleaned = purifier.sanitize(smil, {
    PARSER_MEDIA_TYPE: 'application/xhtml+xml',
    ALLOWED_TAGS: ['svg', 'a', 'animate', 'text'],
    ALLOWED_ATTR: ['attributeName', 'values', 'dur', 'fill'],
  })
  const xml = new DOMParser().parseFromString(cleaned, 'application/xhtml+xml')
  check('XHTML SMIL href', !xml.querySelector('animate')?.hasAttribute('attributeName'))
  check('XHTML normal text', xml.querySelector('text')?.textContent === 'Care')
  const normal = purifier.sanitize('<p>Hello <strong>Roomchang</strong> <em>care</em><a href="https://example.invalid/care">Care</a><img onerror="unsafe()"></p>')
  check('Monaco normal markup', normal === '<p>Hello <strong>Roomchang</strong> <em>care</em><a href="https://example.invalid/care">Care</a><img></p>')
  check('no event execution', globalThis.dependencySecurityXSS === undefined)
  document.documentElement.setAttribute('data-dependency-result', btoa(JSON.stringify({ version: purifier.version, results })))
})()
