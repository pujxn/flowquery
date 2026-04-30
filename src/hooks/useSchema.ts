import { useQuery } from '@tanstack/react-query'
import { FIELDS, type FieldDefinition } from '@/types/fields'

export function useSchema() {
  return useQuery<FieldDefinition[]>({
    queryKey: ['schema'],
    queryFn: async () => {
      const res = await fetch('/api/schema')
      if (!res.ok) throw new Error('Failed to fetch schema')
      return res.json()
    },
    staleTime: Infinity,
    placeholderData: FIELDS,
  })
}
