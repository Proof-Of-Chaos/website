import { useQueryClient } from "@tanstack/react-query"

export function Todos() {
    const queryClient = useQueryClient()
    return <>Hello Todos { JSON.stringify( queryClient ) }</>
}