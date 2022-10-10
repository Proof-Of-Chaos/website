export default function Loader({text="loading"}) {
  return (
    <div className="loader w-full h-64 min-h-fit flex items-center justify-center text-4xl">
      { text.split("").map( char => <span key={ char }>{char}</span>)}
    </div>
  )
}

export function InlineLoader() {
  return (
    <div className="loader inline-flex">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  )
}