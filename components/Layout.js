import Nav from "@/components/Nav"
import { useSession, signIn, signOut } from "next-auth/react"


// const inter = Inter({ subsets: ['latin'] })

export default function Layout({children}) {
  const { data: session } = useSession()

  if(!session){
    return (
      <div className="bg-bgGray w-screen h-screen flex items-center">
      <div className='text-center w-full'>
        <button onClick={()=> signIn('google')} className='bg-white py-2 px-3 rounded-lg text-black'>Login with Google</button>
      </div>
    </div>
    )
  }
  return (
    <div className="bg-bgGray min-h-screen flex">
    <Nav/>
    <div className="bg-white flex-grow flex-col mt-2 mr-2 mb-2 rounded-lg p-4">{children}</div>
    </div>
    
  )
}
