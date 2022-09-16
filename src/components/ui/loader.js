export default function Loader() {
  return (
    <div className="loader w-full h-64 min-h-fit flex items-center justify-center text-4xl">
      <span>l</span>
      <span>o</span>
      <span>a</span>
      <span>d</span>
      <span>i</span>
      <span>n</span>
      <span>g</span>
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