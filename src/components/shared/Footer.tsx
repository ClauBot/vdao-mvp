import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            <span className="text-blue-600 font-bold">V</span>DAO
          </div>

          {/* Links */}
          <nav className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-500">
            <Link href="/explorer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Explorer
            </Link>
            <Separator orientation="vertical" className="h-3" />
            <Link href="/coru" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              CoRu
            </Link>
            <Separator orientation="vertical" className="h-3" />
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              GitHub
            </a>
            <Separator orientation="vertical" className="h-3" />
            <a
              href="https://sepolia.etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Etherscan
            </a>
          </nav>

          {/* Tech badge */}
          <p className="text-xs text-neutral-400 dark:text-neutral-600 text-center sm:text-right">
            Built on Sepolia&nbsp;•&nbsp;Powered by EAS&nbsp;•&nbsp;Open Source
          </p>
        </div>
      </div>
    </footer>
  );
}
