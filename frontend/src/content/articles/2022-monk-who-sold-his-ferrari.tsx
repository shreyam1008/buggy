import type { ArticleMetadata } from './types';
import ArticleImage from '../../components/log/ArticleImage';
import Callout from '../../components/log/Callout';

export const metadata: ArticleMetadata = {
  slug: 'monk-who-sold-his-ferrari',
  title: 'The Monk Who Sold His Ferrari — a book review from the slow lane',
  subtitle: 'Robin Sharma · 1997 · re-read in 2022',
  description:
    'Notes on re-reading Robin Sharma\'s The Monk Who Sold His Ferrari in my ' +
    'mid-twenties — what holds up, what reads as dated self-help parable, and ' +
    'the one chapter I still quote at 6 AM before a ride.',
  date: '2022-03-15',
  category: 'Book Review',
  tags: ['robin-sharma', 'self-help', 'philosophy', 'mindfulness', 'routines'],
  readMinutes: 7,
  cover: {
    src: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1600&q=80&auto=format&fit=crop',
    alt: 'An open book resting on a wooden table with warm morning light on the pages.',
    credit: 'Aaron Burden · Unsplash',
    creditUrl: 'https://unsplash.com/photos/book-lot-on-black-wooden-shelf-y02jEX_B0O0',
    width: 1600,
    height: 900,
  },
  references: [
    { id: 'sharma', author: 'Robin Sharma', label: 'The Monk Who Sold His Ferrari (HarperCollins)', year: 1997, url: 'https://www.goodreads.com/book/show/51031.The_Monk_Who_Sold_His_Ferrari' },
    { id: 'clear',  author: 'James Clear',  label: 'Atomic Habits', year: 2018 },
    { id: 'kahneman', author: 'Daniel Kahneman', label: 'Thinking, Fast and Slow', year: 2011 },
  ],
};

export default function Article() {
  return (
    <>
      <p>
        I first read <em>The Monk Who Sold His Ferrari</em> as a teenager and
        bounced right off it. Too many italicised sentences. Too many sages
        with beards. Too many life rules for a kid who was mostly just trying
        to keep his laptop from overheating. I re-read it eight years later,
        on a cousin's recommendation, while I was trying to decide whether to
        leave a decent engineering job. This time it landed differently —
        enough that I sat down and wrote a post about it, which is this one.
      </p>

      <Callout kind="quote">
        <p>
          "The mind is a wonderful servant, but a terrible master." —
          the line everyone quotes, and the one I finally understood only when
          my Jira board started mastering me.
        </p>
      </Callout>

      <h2 id="premise">The premise, in one paragraph</h2>
      <p>
        Julian Mantle, a burnt-out Harvard-trained litigator with a red
        Ferrari and a cardiac event, sells everything and walks into the
        Himalayas. He comes back with <strong>seven fables</strong> from a
        fictional order of sages. The book is structured around those
        fables, each teaching a lesson — mostly about attention, routine,
        purpose, and a thing the book calls "the garden of the mind." [<a href="#ref-sharma">1</a>]
      </p>
      <p>
        If this sounds corny, that's because it is corny. There is no
        getting around the 1997 self-help prose. But corny does not mean
        wrong, and I think it's worth separating those two things in our
        heads, because the internet has conditioned us to laugh at
        earnestness, and then we spend our thirties wondering why nothing
        moves us anymore.
      </p>

      <ArticleImage
        src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1400&q=80&auto=format&fit=crop"
        alt="A person sitting in meditation posture at golden hour, facing a valley."
        width={1400}
        height={933}
        caption="Sharma's central bet is that stillness is a skill, not a mood."
        credit="Simon Migaj · Unsplash"
        creditUrl="https://unsplash.com/photos/Yui5vfKHuzs"
      />

      <h2 id="what-holds-up">What holds up</h2>
      <p>
        Three things genuinely hold up, and one of them changed the shape of
        my week.
      </p>
      <h3 id="hold-1">1 · The "Ritual of Solitude"</h3>
      <p>
        Sharma argues for <strong>fifteen to sixty minutes of daily silence</strong>,
        ideally in nature. No headphones, no phone, no productivity podcast
        whispering about the seven habits of a thing. Just silence.
      </p>
      <p>
        I am not a naturally quiet person, and I work in an industry that
        pays us to manufacture noise (notifications, tickets, standups,
        "quick syncs"). After a week of this ritual, I stopped reaching for
        my phone every time I was mildly bored. After a month, my attention
        span for deep work roughly doubled — not scientifically measured,
        but measured in the number of pull requests I could review without
        spiralling into Twitter.
      </p>

      <h3 id="hold-2">2 · "Live fully, die happy" isn't as cheesy as it reads</h3>
      <p>
        The recurring call to live with urgency is the kind of thing that
        sells hoodies at airports, but Sharma writes it earnestly, and
        earnestness is a quiet superpower in a cynical decade. The book's
        most useful frame, for me, was the idea that <em>time is your
        currency</em> — not a lifestyle quote, a budgeting lens.
      </p>
      <p>
        I started tracking how I was spending hours the way I track how I'm
        spending money. The results were ugly. But a bad budget is easier
        to fix than a bad vibe.
      </p>

      <h3 id="hold-3">3 · The garden metaphor (used in moderation)</h3>
      <p>
        The idea that your mind is a garden, and what you water will grow,
        is about a thousand years older than this book, and Sharma knows
        it. He's not pretending to be original — he's packaging ancient
        ideas for a lawyer-brained reader. That's a useful trade.
      </p>

      <h2 id="what-doesnt">What does not hold up</h2>
      <p>
        The sage-in-the-mountains frame is cringe in 2022. The prose is
        over-italicised. There's a confidence in the book that <em>one
        routine</em> will unlock you — which, after reading James Clear's{' '}
        <em>Atomic Habits</em> [<a href="#ref-clear">2</a>] and living
        through a pandemic, reads as optimistic in a way that borders on
        dangerous.
      </p>
      <p>
        Also: Sharma rarely names the cost of any of this. Waking up at
        5 AM is free if you have no kids, no night shift, and a back that
        does not hurt. The book is a manual for a narrow kind of life that
        does not look like most people's life. That doesn't make it wrong,
        but it should make us suspicious of taking any single chapter as
        gospel.
      </p>

      <Callout kind="warn" title="caveat">
        <p>
          Self-help books are data, not instructions. Treat them the way
          you'd treat a blog post from a senior engineer at a company you
          don't work for: learn the frame, ignore the specifics.
        </p>
      </Callout>

      <h2 id="the-chapter-i-still-quote">The chapter I still quote</h2>
      <p>
        There's a fable about the sumo wrestler and the lighthouse. I
        won't spoil it — it's the one payoff in the book I think even
        cynical readers will grudgingly enjoy. What I took from it, and
        what I still say to myself before long rides, is:
      </p>
      <blockquote>
        <p>
          You cannot out-think discomfort. You can only out-show-up it.
        </p>
      </blockquote>
      <p>
        That line isn't in the book verbatim. It's the compression I did on
        one of the fables, in my own words, and it's the thing that comes
        back to me at kilometre 60 when the legs are arguing with the
        head. Kahneman [<a href="#ref-kahneman">3</a>] would say System 1
        is bargaining with System 2. Sharma would say the mind is
        bargaining with the heart. Both are true, and the answer is the
        same — keep pedalling.
      </p>

      <h2 id="tldr">TL;DR</h2>
      <ul>
        <li><strong>Read it?</strong> Yes, but read it as a <em>compression of ancient ideas</em>, not a life manual.</li>
        <li><strong>Best chapter:</strong> The Ritual of Solitude. Start there, skip the rest if you're short on time.</li>
        <li><strong>Skip it if:</strong> you've already read anything by Thich Nhat Hanh or Marcus Aurelius — you'll recognise 80% of the ideas in their better homes.</li>
        <li><strong>Would I re-read it again in five years?</strong> Probably not. But I'm glad I re-read it once. Some books just want you to notice one thing.</li>
      </ul>

      <hr />

      <p style={{ fontStyle: 'italic', opacity: 0.7 }}>
        Next up in my 2022 reading log: <em>Thinking, Fast and Slow</em>.
        Shorter review, longer aftertaste.
      </p>
    </>
  );
}
