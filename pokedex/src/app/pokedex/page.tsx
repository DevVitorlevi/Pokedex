"use client"
import { useState, useEffect, useRef } from "react"

interface Pokemon {
  id: number
  name: string
  types: { type: { name: string } }[]
  sprites: { other: { "official-artwork": { front_default: string } } }
}

const typeGradients: { [key: string]: string } = {
  grass: "linear-gradient(to right, #4E8234, #6B9B4D)",
  bug: "linear-gradient(to right, #728F23, #9DB650)",
  ice: "linear-gradient(to right, #5CACA7, #88C4C2)",
  water: "linear-gradient(to right, #3A6EBF, #6A9FE1)",
  fire: "linear-gradient(to right, #C14620, #E08A50)",
  fighting: "linear-gradient(to right, #8B1F1A, #C35D42)",
  dragon: "linear-gradient(to right, #4D22B8, #7D5FD6)",
  normal: "linear-gradient(to right, #7B7B5F, #B0AA7D)",
  ghost: "linear-gradient(to right, #4F3B77, #7D6ACA)",
  poison: "linear-gradient(to right, #702C7C, #A05BA8)",
  psychic: "linear-gradient(to right, #C93665, #E78FA1)",
  fairy: "linear-gradient(to right, #9F5676, #C68C9B)",
  ground: "linear-gradient(to right, #A18442, #C2A877)",
  electric: "linear-gradient(to right, #D7B800, #F0D22C)",
  rock: "linear-gradient(to right, #8B7B32, #B8A768)",
  steel: "linear-gradient(to right, #6C6C78, #9DA3A6)",
  dark: "linear-gradient(to right, #3A2E2F, #5C4B50)",
  flying: "linear-gradient(to right, #7B8FA1, #A3B1C1)",
}

export default function Pokedex() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [generationFilter, setGenerationFilter] = useState("")
  const [order, setOrder] = useState("")
  const [types, setTypes] = useState<any[]>([])
  const [generations, setGenerations] = useState<any[]>([])
  const [pokemons, setPokemons] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(false)
  const [currentGenIndex, setCurrentGenIndex] = useState(0)
  const genRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set())

  const generationIds: { [key: string]: [number, number] } = {
    "generation-i": [1, 151],
    "generation-ii": [152, 251],
    "generation-iii": [252, 386],
    "generation-iv": [387, 493],
    "generation-v": [494, 649],
    "generation-vi": [650, 721],
    "generation-vii": [722, 809],
    "generation-viii": [810, 898],
    "generation-ix": [899, 1010],
  }
  const genOrder = Object.keys(generationIds)

  // Carregar tipos e gerações
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/type")
      .then(res => res.json())
      .then(data => setTypes(data.results.filter((t: any) => !["shadow","unknown"].includes(t.name))))

    fetch("https://pokeapi.co/api/v2/generation")
      .then(res => res.json())
      .then(data => setGenerations(data.results.filter((g:any)=>genOrder.includes(g.name))))
  }, [])

  const fetchPokemonByName = async (name: string) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
      if (!res.ok) return null
      const data = await res.json()
      return data
    } catch {
      return null
    }
  }

  const fetchPokemonsByType = async (type: string) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
      const data = await res.json()
      return data.pokemon.map((p: any) => p.pokemon.name)
    } catch {
      return []
    }
  }

  const fetchPokemonsByGeneration = async (generation: string) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`)
      const data = await res.json()
      return data.pokemon_species.map((p: any) => p.name)
    } catch {
      return []
    }
  }

  // Carregar Pokémons conforme filtros
  const loadFilteredPokemons = async () => {
    // Se não houver filtros, reset para primeira geração
    if (!search && !typeFilter && !generationFilter) {
      setPokemons([])
      setCurrentGenIndex(0)
      await loadNextGeneration()
      return
    }

    setLoading(true)
    let namesSet: Set<string> | null = null

    if (search) {
      const p = await fetchPokemonByName(search)
      namesSet = p ? new Set([p.name]) : new Set()
    }

    if (typeFilter) {
      const typeNames = await fetchPokemonsByType(typeFilter)
      namesSet = namesSet ? new Set([...namesSet].filter(n => typeNames.includes(n))) : new Set(typeNames)
    }

    if (generationFilter) {
      const genNames = await fetchPokemonsByGeneration(generationFilter)
      namesSet = namesSet ? new Set([...namesSet].filter(n => genNames.includes(n))) : new Set(genNames)
    }

    const namesArray = Array.from(namesSet || [])
    const detailedPokemons = await Promise.all(namesArray.map(n => fetchPokemonByName(n)))
    setPokemons(detailedPokemons.filter(Boolean) as Pokemon[])
    setLoading(false)
  }

  useEffect(() => {
    loadFilteredPokemons()
  }, [search, typeFilter, generationFilter])

  const fetchGenerationIncremental = async (genName: string) => {
    const [start, end] = generationIds[genName]
    for (let i = start; i <= end; i++) {
      const data = await fetchPokemonByName(i.toString())
      if (data) setPokemons(prev => [...prev, data])
    }
  }

  const loadNextGeneration = async () => {
    if (currentGenIndex >= genOrder.length) return
    setLoading(true)
    await fetchGenerationIncremental(genOrder[currentGenIndex])
    setCurrentGenIndex(prev => prev + 1)
    setLoading(false)
  }

  const filteredPokemons = pokemons.sort((a,b)=>{
    if(!order) return 0
    if(order==="id-asc") return a.id-b.id
    if(order==="id-desc") return b.id-a.id
    if(order==="name-asc") return a.name.localeCompare(b.name)
    if(order==="name-desc") return b.name.localeCompare(a.name)
    return 0
  })

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = Number(entry.target.getAttribute("data-id"))
        if(entry.isIntersecting){
          setVisibleIds(prev => new Set(prev.add(id)))
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    genRefs.current.forEach(ref => ref && observer.observe(ref))
    return () => observer.disconnect()
  }, [filteredPokemons])

  return (
    <div className="bg-white w-full min-h-[100vh]">
      <div className="flex flex-col items-center justify-center px-6 mt-8">
        <h1 className="text-4xl text-center mb-6">
          {pokemons.length} <span className="font-bold">Pokémons</span> for you to choose your favorite
        </h1>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-[1500px]">
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-80 bg-[#F2F2F2] p-4 rounded-2xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-48 bg-[#F2F2F2] p-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 capitalize"
          >
            <option value="">Todos os tipos</option>
            {Object.keys(typeGradients).map(type => (
              <option key={type} value={type} className="capitalize">{type}</option>
            ))}
          </select>
          <select
            value={generationFilter}
            onChange={e => setGenerationFilter(e.target.value)}
            className="w-48 bg-[#F2F2F2] p-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 capitalize"
          >
            <option value="">Todas as gerações</option>
            {generations.map((g, idx) => (
              <option key={g.name} value={g.name}>Gen {idx + 1}</option>
            ))}
          </select>
          <select
            value={order}
            onChange={e => setOrder(e.target.value)}
            className="w-48 bg-[#F2F2F2] p-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Ordenar</option>
            <option value="id-asc">ID ↑</option>
            <option value="id-desc">ID ↓</option>
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-8 max-w-[1200px] mx-auto">
        {filteredPokemons.map((p,i) => (
          <div
            key={`${p.id}-${i}`}
            ref={el => { if(el) genRefs.current.set(p.id, el) }}
            data-id={p.id}
            className={`rounded-2xl shadow-2xl flex items-center justify-between transform transition-all duration-500 hover:scale-105 hover:shadow-xl bg-[#f5f4f4]
              ${visibleIds.has(p.id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="flex flex-col justify-center items-center space-y-2 ml-2 w-[35%] sm:w-[50%]">
              <p>Nº {p.id.toString().padStart(3,'0')}</p>
              <h2 className="capitalize font-semibold text-xl sm:text-2xl">{p.name}</h2>
              <div className="flex gap-2 sm:gap-4 mt-2 justify-center">
                {p.types.map(t => (
                  <span key={t.type.name} className="px-2 py-1 text-xs sm:text-sm rounded-full capitalize text-white"
                    style={{background:typeGradients[t.type.name]||"#ccc"}}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-[65%] rounded-br-2xl rounded-tr-2xl flex justify-center items-center p-2"
              style={{ background:typeGradients[p.types[0].type.name]||"#fff" }}>
              <img 
                src={p.sprites.other["official-artwork"].front_default} 
                alt={p.name} 
                className="w-36 sm:w-44 md:w-48 lg:w-52 h-auto object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Botão carregar mais */}
      {!search && !typeFilter && !generationFilter && currentGenIndex < genOrder.length && (
        <div className="flex justify-center my-8">
          <button 
            onClick={loadNextGeneration} 
            className="px-6 py-3 bg-yellow-400 text-white rounded-2xl shadow-lg hover:bg-yellow-500 transition-colors"
          >
            {loading ? "Carregando..." : "Ver mais"}
          </button>
        </div>
      )}
    </div>
  )
}
