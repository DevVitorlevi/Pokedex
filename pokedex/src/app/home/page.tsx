import Image from "next/image"
import Link from "next/link"
export default function HomePage() {
  return (
      <div className="bg-gradient-to-b from-[#F5DB13] to-[#F2B807] w-screen h-[calc(100vh-89px)]">
        <div className="flex items-center justify-between h-full">
            <div className="w-3xl flex-col space-y-25 ml-50">
                <h1 className="text-7xl tracking-[1rem]"><span className="font-bold">Find</span> all your  favorite <span className="font-bold">Pokemon</span></h1>
                <h2 className="text-4xl">You can know the type of Pokemon, its strengths, disadvantages and <br /> abilities</h2>
                <button className="relative bg-[#73D677]
               text-black text-2xl font-bold py-3 px-6 rounded-lg
               shadow-[0_8px_0_0_#398d3c] 
               hover:shadow-[0_4px_0_0_#398d3c]
               active:translate-y-2 active:shadow-[0_4px_0_0_#398d3c] 
               transition-all duration-200"><Link href={'/pokedex'}>See Pokemons</Link></button>
            </div>
            <div>
            </div>  
        </div>
      </div>
  )
}
