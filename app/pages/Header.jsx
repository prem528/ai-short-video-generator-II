import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 animated-gradient ">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            AI Video Gen
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="#features" className=" text-white hover:text-black transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-white hover:text-black transition-colors">How It Works</Link>
            <Link href="#pricing" className="text-white hover:text-black transition-colors">Pricing</Link>
          </div>
          <div className="flex gap-3 items-center">
          <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors">
            Get Started
          </Link>
          <UserButton/>
          </div>
        </div>
      </nav>
    </header>
  )
}

