import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Mini LMS</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        This is the index page. Please log in or sign up to continue.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
        >
          Log in
        </Link>
        <Link 
          href="/signup" 
          className="px-6 py-2 bg-gray-200 text-gray-900 font-medium rounded-md hover:bg-gray-300 transition"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
