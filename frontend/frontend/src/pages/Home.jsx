export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 text-xl font-bold">
        CDC AI Platform
      </nav>

      {/* Content */}
      <div className="flex flex-col items-center justify-center mt-20 gap-6">

        {/* Upload button */}
        <input type="file" className="border p-2 bg-white" />

        {/* Generate button */}
        <button className="bg-green-600 text-white px-6 py-3 rounded">
          Générer CDC
        </button>

      </div>
    </div>
  )
}