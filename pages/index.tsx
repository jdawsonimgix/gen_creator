import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSWR('/api/upload', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  return <p>{data.key}</p>
}

/*


*/
