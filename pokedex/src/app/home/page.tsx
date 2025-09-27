import Image from "next/image"
import Link from "next/link"
import Pika from "@/assets/pikachu.png"

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-[#F5DB13] to-[#F2B807] w-full min-h-screen">
      <div className="sm:flex flex-col justify-center items-center lg:flex-row-reverse lg:gap-20 lg:justify-between lg:items-center lg:min-h-[100vh]">
        <Image src={Pika} alt="Pikachu" className="lg:w-140 lg:h-140 xl:w-200 xl:h-200" />
        <div className="flex flex-col gap-6 items-center justify-center text-center lg:items-start lg:text-left lg:m-10 xl:ml-20">
          <h1 className="text-3xl md:text-5xl xl:text-7xl">
            <span className="font-bold">Find</span> all your favorite{" "}
            <span className="font-bold">Pokemon</span>
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-2xl xl:text-4xl">
            You can know the type of Pokemon, its strengths, disadvantages and <br />
            abilities
          </h2>
          <button
            className="relative bg-[#73D677] text-black text-2xl font-bold rounded-lg
            shadow-[0_8px_0_0_#398d3c] 
            hover:shadow-[0_4px_0_0_#398d3c]
            active:translate-y-2 active:shadow-[0_4px_0_0_#398d3c] 
            transition-all duration-200 py-1 px-3 md:py-3 md:px-6"
          >
            <Link href="/pokedex">See Pokemons</Link>
          </button>
        </div>
      </div>
    </div>
  )
}
