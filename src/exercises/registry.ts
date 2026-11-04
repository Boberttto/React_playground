import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Exercises are discovered automatically from the folder structure:
 *   src/exercises/<level>/<NN-slug>/{README.md, Exercise.tsx, Solution.tsx}
 * No manual registration needed — drop a folder in and it shows up.
 * https://vite.dev/guide/features#glob-import
 */

export type Level = 'junior' | 'intermediate' | 'senior'
export const LEVELS: Level[] = ['junior', 'intermediate', 'senior']

type Module = { default: ComponentType }

export type ExerciseEntry = {
  id: string // e.g. "junior/01-jsx-props"
  level: Level
  number: number
  title: string
  readme: string
  Exercise: LazyExoticComponent<ComponentType>
  Solution: LazyExoticComponent<ComponentType>
  loadSolutionSource: () => Promise<string>
}

const readmes = import.meta.glob<string>('./*/*/README.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const exercises = import.meta.glob<Module>('./*/*/Exercise.tsx')
const solutions = import.meta.glob<Module>('./*/*/Solution.tsx')
const solutionSources = import.meta.glob<string>('./*/*/Solution.tsx', {
  query: '?raw',
  import: 'default',
})

function titleFrom(readme: string, fallback: string) {
  const match = readme.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : fallback
}

export const registry: ExerciseEntry[] = Object.entries(readmes)
  .map(([path, readme]) => {
    const dir = path.replace(/\/README\.md$/, '') // ./junior/01-jsx-props
    const id = dir.slice(2)
    const [level, slug] = id.split('/') as [Level, string]
    const exerciseLoader = exercises[`${dir}/Exercise.tsx`]
    const solutionLoader = solutions[`${dir}/Solution.tsx`]
    const sourceLoader = solutionSources[`${dir}/Solution.tsx`]
    if (!exerciseLoader || !solutionLoader || !sourceLoader) {
      throw new Error(`Exercise "${id}" must contain Exercise.tsx and Solution.tsx`)
    }
    return {
      id,
      level,
      number: Number.parseInt(slug, 10),
      title: titleFrom(readme, slug),
      readme,
      Exercise: lazy(exerciseLoader),
      Solution: lazy(solutionLoader),
      loadSolutionSource: sourceLoader,
    }
  })
  .sort((a, b) => a.number - b.number)

export function findExercise(id: string) {
  return registry.find((e) => e.id === id)
}
