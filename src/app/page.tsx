export default function HomePage() {
  return (
    <main className="space-y-8">
      <header>
        <h2 className="text-3xl font-semibold tracking-tight">
          Rules: 
        </h2>
        <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
          A running log of what I watch and read.
          <br /><br />
          <span className="font-bold uppercase">All caps, bold</span>: MOVIE
          <br />
          <span className="font-bold uppercase">All caps, bold, asterisk</span>: SHORT*
          <br />
          <span className="uppercase">All caps</span>: TV SERIES
          <br />
          <span className="italic">Italics</span>: Book
          <br />
          Quotation marks: "Play"
          <br />
          <span className="italic">Italics, quotation marks</span>: "Short Story"
        </p>
      </header>
      
      <section className="space-y-6">
        <div>
          <h2 className="text-neutral-500 text-sm mb-2">02 / 2026</h2>
          <ul className="space-y-1">
            <li className="movies">02/13 IS THIS THING ON?</li>
          </ul>
        </div>
      </section>
    </main>
  );
}