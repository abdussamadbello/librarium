import { Search, ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const mockBooks = [
  {
    id: 1,
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    tags: ['Non-Fiction', 'Finance'],
  },
  {
    id: 2,
    title: 'Company of One',
    author: 'Paul Jarvis',
    tags: ['Business'],
  },
  {
    id: 3,
    title: 'How Innovation Works',
    author: 'Matt Ridley',
    tags: ['Science', 'Popular'],
  },
  {
    id: 4,
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    tags: ['Classic', 'Fiction'],
  },
  {
    id: 5,
    title: 'The Subtle Art',
    author: 'Mark Manson',
    tags: ['Self-Help'],
  },
  {
    id: 6,
    title: 'Atomic Habits',
    author: 'James Clear',
    tags: ['Self-Help', 'Productivity'],
  },
]

function BookCard({ book }: { book: typeof mockBooks[0] }) {
  return (
    <div className="flex-shrink-0 w-48 group cursor-pointer">
      <div className="relative rounded-lg overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
          <span className="text-slate-400 text-sm">Book Cover</span>
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-sm text-zinc-900 truncate">{book.title}</h3>
        <p className="text-xs text-neutral-500">{book.author}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {book.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <>
      {/* Hero Search Section */}
      <section className="mb-8 p-8 bg-gradient-to-r from-primary-teal to-teal-700 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">
          Discover your next great read
        </h1>
        <p className="text-teal-100 mb-6">Find your next favorite book, right here.</p>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title, author, or keyword..."
              className="w-full bg-white rounded-lg p-4 pl-12 text-base text-zinc-900 placeholder-neutral-500 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          </div>
          <button className="flex-shrink-0 w-full md:w-auto flex items-center justify-center bg-primary-gold text-white rounded-lg px-6 py-4 text-sm font-medium shadow-sm hover:bg-amber-600 transition-colors">
            <span>All Categories</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="space-y-8">
        {/* Book Recommendation Carousel */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-900">Book Recommendation</h2>
            <button className="flex items-center text-sm font-medium text-primary-teal hover:text-teal-800">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
            {mockBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </Card>

        {/* Recently Added */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-900">Recently Added</h2>
            <button className="flex items-center text-sm font-medium text-primary-teal hover:text-teal-800">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="flex space-x-6 overflow-x-auto pb-4 -mb-4">
            {[...mockBooks].reverse().map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </Card>

        {/* Book Categories */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-900">Book Category</h2>
            <button className="flex items-center text-sm font-medium text-primary-teal hover:text-teal-800">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Fiction', 'Business', 'Self Improvement', 'Science', 'History', 'Technology'].map((category, i) => {
              const colors = [
                'bg-purple-100 text-purple-600',
                'bg-blue-100 text-blue-600',
                'bg-pink-100 text-pink-600',
                'bg-green-100 text-green-600',
                'bg-orange-100 text-orange-600',
                'bg-indigo-100 text-indigo-600',
              ]
              return (
                <div
                  key={category}
                  className={`p-5 rounded-lg flex items-center space-x-4 border border-neutral-200 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${colors[i]}`}
                >
                  <div className={`p-2 rounded-full ring-4 ring-white ${colors[i]}`}>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{category}</h3>
                    <span className="text-sm text-neutral-600">Browse</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </>
  )
}
