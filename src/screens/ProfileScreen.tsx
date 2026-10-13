export function ProfileScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
      <h2 className="text-2xl font-semibold mb-4 text-brand-text">Profile</h2>
      <div className="w-24 h-24 mb-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
      <p className="text-gray-600 mb-6">Your profile will appear here</p>
      <button disabled className="px-6 py-2 bg-gray-300 text-gray-500 rounded-full font-medium cursor-not-allowed">
        Sign in
      </button>
    </div>
  );
}
