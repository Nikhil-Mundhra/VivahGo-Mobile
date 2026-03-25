export default function VendorPortfolioGallery({ media, onRemove }) {
  if (!media || media.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        No photos or videos yet. Upload some above to showcase your work.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
      {media.map(item => (
        <div
          key={item._id || item.url}
          className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square"
        >
          {item.type === 'VIDEO' ? (
            <video
              src={item.url}
              preload="metadata"
              controls
              className="w-full h-full object-cover"
              aria-label={item.filename || 'Portfolio video'}
            />
          ) : (
            <img
              src={item.url}
              alt={item.filename || 'Portfolio image'}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}

          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item._id)}
              className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              aria-label="Remove media item"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
