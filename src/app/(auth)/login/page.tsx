import Form from 'next/form'
import { submitLogin } from './actions'

export default function Home() {
  return (
    <div className="container mx-auto mt-20 text-center">
      <h1>Login Page</h1>
      <Form action={submitLogin}>
        <label htmlFor="email">Email</label>
        <input className='border m-2' type="text" id="email" name="email" required />
        <br/>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Login</button>
      </Form>
    </div>
  )
}