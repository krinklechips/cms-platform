import { Link } from 'react-router'

export function WwwFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">SL</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">Serviette Labs</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Content management built for healthcare. From single clinics to regional networks.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 mb-3">Product</p>
              <a href="/#features" className="block text-gray-500 hover:text-gray-800 transition-colors">Features</a>
              <Link to="/pricing" className="block text-gray-500 hover:text-gray-800 transition-colors">Pricing</Link>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 mb-3">Account</p>
              <a href="/platform-admin" className="block text-gray-500 hover:text-gray-800 transition-colors">Sign in</a>
              <a href="mailto:hello@serviettelabs.com" className="block text-gray-500 hover:text-gray-800 transition-colors">Contact us</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Serviette Labs. All rights reserved.</p>
          <p>Built for clinics.</p>
        </div>
      </div>
    </footer>
  )
}
