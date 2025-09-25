"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import Logo from "@/assets/group.png"

export default function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: "/home", label: "Home" },
    { href: "/pokedex", label: "Pokedex" },
    { href: "/legends", label: "Legendaries" },
  ]

  return (
    <header className="bg-[#F5DB13] flex items-center justify-between p-4 shadow-lg relative">
      {/* Logo */}
        <Image src={Logo} alt="" className="w-40"></Image>
      {/* Desktop menu */}
      <nav className="hidden md:flex">
        <ul className="flex space-x-10">
          {links.map(({ href, label }) => (
            <li key={href} className="text-2xl relative">
              <Link href={href}>{label}</Link>
              {pathname === href && (
                <span className="absolute left-0 -bottom-1 w-full h-1 bg-black rounded"></span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Hamburger button */}
      <button
        className="md:hidden text-3xl focus:outline-none"
        onClick={() => setMenuOpen(true)}
      >
        <Menu size={32} className="cursor-pointer"/>
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-[#000000a0] z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* Side menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#F5DB13] z-50 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            className="text-3xl focus:outline-none"
            onClick={() => setMenuOpen(false)}
          >
            <X size={32} className="cursor-pointer"/>
          </button>
        </div>
        <ul className="flex flex-col items-start space-y-6 p-6 text-2xl">
          {links.map(({ href, label }) => (
            <li key={href} className="w-full">
              <Link
                href={href}
                className="block w-full"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
              {pathname === href && (
                <span className="block w-full h-1 bg-black rounded mt-1"></span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
