export default function TaskBoardSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6 flex-1 overflow-hidden">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-gray-50 rounded-md p-4 animate-pulse">
          <div className="mb-4">
            <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-8"></div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, cardIndex) => (
              <div key={cardIndex} className="bg-white rounded-md p-3 border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
