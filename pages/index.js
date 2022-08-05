import { useRouter } from 'next/router'
import { useEffect } from "react"

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('completed')) {
      localStorage.removeItem('userId');
      localStorage.removeItem('ingredients');
      localStorage.removeItem('questionId');
      localStorage.removeItem('completed');
    } else if (localStorage.getItem('userId')) {
      router.push('/question');
    }
  }, [])

  const start = () => {
    router.push('/question');
  };

  return (
    <p className="description">
      <button onClick={start}>
        Start
      </button>
    </p>
  )
}
