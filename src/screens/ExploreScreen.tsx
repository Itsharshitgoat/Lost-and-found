export function ExploreScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
      <h2 className="text-2xl font-semibold mb-4 text-brand-text">Explore</h2>
      <div className="w-24 h-24 mb-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" x2="9" y1="3" y2="18"></line><line x1="15" x2="15" y1="6" y2="21"></line></svg>
      </div>
      <p className="text-gray-600">Discover lost and found items near you</p>
    </div>
  );
}
