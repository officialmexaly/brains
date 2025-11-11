export default function FloatingActionButton() {
  return (
    <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-3xl font-light hover:rotate-90 duration-300 group">
      <span className="group-hover:rotate-[-90deg] transition-transform duration-300">+</span>
    </button>
  );
}
