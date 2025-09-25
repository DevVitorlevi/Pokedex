"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"

interface Pokemon {
  id: number
  name: string
  types: { type: { name: string } }[]
  sprites: { other: { "official-artwork": { front_default: string } } }
}

interface Type {
  name: string
  url: string
}

interface Generation {
  name: string
  url: string
}

const typeGradients: Record<string, string> = {
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
  const [types, setTypes] = useState<Type[]>([])
  const [generations, setGenerations] = useState<Generation[]>([])
  const [pokemons, setPokemons] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(false)
  const [currentGenIndex, setCurrentGenIndex] = useState(0)
  const genRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set())

  const generationIds: Record<string, [number, number]> = {
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
      .then(data => setTypes(data.results.filter((t: Type) => !["shadow","unknown"].includes(t.name))))

    fetch("https://pokeapi.co/api/v2/generation")
      .then(res => res.json())
      .then(data => setGenerations(data.results.filter((g: Generation) => genOrder.includes(g.name))))
  }, [genOrder])

  const fetchPokemonByName = async (nameOrId: string | number): Promise<Pokemon | null> => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`)
      if (!res.ok) return null
      const data = await res.json()
      return data
    } catch {
      return null
    }
  }

  const fetchPokemonsByType = async (type: string): Promise<string[]> => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
      const data = await res.json()
      return data.pokemon.map((p: { pokemon: { name: string } }) => p.pokemon.name)
    } catch {
      return []
    }
  }

  const fetchPokemonsByGeneration = async (generation: string): Promise<string[]> => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`)
      const data = await res.json()
      return data.pokemon_species.map((p: { name: string }) => p.name)
    } catch {
      return []
    }
  }

  // Carregar Pokémons conforme filtros
  const loadFilteredPokemons = useCallback(async () => {
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
  }, [search, typeFilter, generationFilter])

  useEffect(() => {
    loadFilteredPokemons()
  }, [loadFilteredPokemons])

  const fetchGenerationIncremental = async (genName: string) => {
    const [start, end] = generationIds[genName]
    for (let i = start; i <= end; i++) {
      const data = await fetchPokemonByName(i)
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

  const filteredPokemons = [...pokemons].sort((a, b) => {
    if (!order) return 0
    if (order === "id-asc") return a.id - b.id
    if (order === "id-desc") return b.id - a.id
    if (order === "name-asc") return a.name.localeCompare(b.name)
    if (order === "name-desc") return b.name.localeCompare(a.name)
    return 0
  })

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = Number(entry.target.getAttribute("data-id"))
        if (entry.isIntersecting) {
          setVisibleIds(prev => new Set(prev).add(id))
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    genRefs.current.forEach(ref => ref && observer.observe(ref))
    return () => observer.disconnect()
  }, [filteredPokemons])

  return (
    <div className="bg-white w-full min-h-[100vh]">
      {/* ... restante do JSX permanece igual, sem alteração necessária ... */}
    </div>
  )
}
