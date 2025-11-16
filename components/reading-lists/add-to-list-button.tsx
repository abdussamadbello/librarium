'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { BookmarkPlus, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReadingList {
  id: number
  name: string
}

interface AddToListButtonProps {
  bookId: number
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export function AddToListButton({ bookId, className, variant = 'outline' }: AddToListButtonProps) {
  const [lists, setLists] = useState<ReadingList[]>([])
  const [listsWithBook, setListsWithBook] = useState<number[]>([])
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLists()
    checkBookInLists()
  }, [bookId])

  const fetchLists = async () => {
    try {
      const res = await fetch('/api/reading-lists')
      if (res.ok) {
        const data = await res.json()
        setLists(data.lists.map((l: any) => l.list))
      }
    } catch (error) {
      console.error('Error fetching lists:', error)
    }
  }

  const checkBookInLists = async () => {
    try {
      const res = await fetch(`/api/reading-lists/check?bookId=${bookId}`)
      if (res.ok) {
        const data = await res.json()
        setListsWithBook(data.lists.map((l: ReadingList) => l.id))
      }
    } catch (error) {
      console.error('Error checking lists:', error)
    }
  }

  const toggleBookInList = async (listId: number, isInList: boolean) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reading-lists/${listId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          action: isInList ? 'remove' : 'add',
        }),
      })

      if (res.ok) {
        if (isInList) {
          setListsWithBook(prev => prev.filter(id => id !== listId))
        } else {
          setListsWithBook(prev => [...prev, listId])
        }
      }
    } catch (error) {
      console.error('Error toggling book in list:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <Button
        variant={variant}
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className={cn('gap-2', className)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <BookmarkPlus className="w-4 h-4" />
        )}
        Add to List
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lift z-20 overflow-hidden">
            <div className="p-2 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-900">Add to Reading List</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {lists.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No lists yet
                </div>
              ) : (
                lists.map((list) => {
                  const isInList = listsWithBook.includes(list.id)
                  return (
                    <button
                      key={list.id}
                      onClick={() => toggleBookInList(list.id, isInList)}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm text-slate-900">{list.name}</span>
                      {isInList && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
