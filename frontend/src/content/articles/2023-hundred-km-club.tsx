import type { ArticleMetadata } from './types';
import ArticleImage from '../../components/log/ArticleImage';
import Callout from '../../components/log/Callout';

export const metadata: ArticleMetadata = {
  slug: 'hundred-km-club',
  title: 'The Day I Finished My First 100 km — a cycling journal entry',
  subtitle: 'Kathmandu valley · June 2023 · one sunrise, two flat tyres',
  description:
    'What actually happens, hour by hour, during a first century ride. Gear, ' +
    'nutrition, the mental wall at km 70, and why the post-ride shower is the ' +
    'best shower of the year.',
  date: '2023-06-10',
  category: 'Cycling',
  tags: ['cycling', 'strava', 'endurance', 'kathmandu', 'first-century'],
  readMinutes: 8,
  featured: true,
  cover: {
    src: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80&auto=format&fit=crop',
    alt: 'A road cyclist climbing a winding mountain road at sunrise, surrounded by mist.',
    credit: 'Coen van de Broek · Unsplash',
    creditUrl: 'https://unsplash.com/photos/9J3HfOqVx-w',
    width: 1600,
    height: 900,
  },
  references: [
    { id: 'strava', label: 'Strava Activity · athletes/113238146', url: 'https://www.strava.com/athletes/113238146' },
    { id: 'fueling', label: 'TrainingPeaks · Fueling for long rides', url: 'https://www.trainingpeaks.com/learn/articles/' },
  ],
};

export default function Article() {
  return (
    <>
      <p>
        A century ride — 100 kilometres in one go — sits in a funny place
        in the cyclist head. It is not an elite distance. Club riders do it
        before breakfast. It is also not a casual distance. The first time
        you try it, it will find every weak link in your bike, your
        nutrition, your sleep, and your self-respect.
      </p>

      <p>
        I tried mine in June 2023, in and around the Kathmandu valley. What
        follows is not a training guide. It is a <em>log</em>. Use it the
        way you'd use someone else's postmortem — for the shape, not the
        numbers.
      </p>

      <Callout kind="info" title="context">
        <p>
          At the time of this ride: ~6 months of consistent riding,
          ~40&nbsp;km longest previous distance, a mid-range road bike, and
          roughly zero formal coaching. I was not fit. I was just stubborn.
        </p>
      </Callout>

      <h2 id="the-night-before">The night before</h2>
      <p>
        I made the rookie mistake of <strong>going to bed "early"</strong>,
        which, when your body is not conditioned for it, means lying awake
        for two hours thinking about whether the chain needs lube. Slept
        four hours. Woke at 4:50 AM. My legs were fine. My head was
        already tired.
      </p>
      <p>
        I had prepped everything the night before:
      </p>
      <ul>
        <li>2 × 750 ml bottles (one plain water, one electrolyte).</li>
        <li>4 energy gels, 1 banana, 2 granola bars, 1 emergency snickers.</li>
        <li>Multi-tool, 2 tubes, mini-pump, tyre levers, a small first-aid pouch.</li>
        <li>₹500 cash stashed in the saddle bag — the most underrated piece of gear in South Asia.</li>
      </ul>

      <h3 id="gear-note">Note on gear</h3>
      <p>
        You do not need a carbon bike to ride 100 km. You do need a bike
        that fits and shoes that don't hurt. Everything else is optional.
        If someone tells you otherwise, check whether they work in the
        bike industry.
      </p>

      <ArticleImage
        src="https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=1400&q=80&auto=format&fit=crop"
        alt="An empty country road at sunrise, winding gently into the distance with fields on either side."
        width={1400}
        height={933}
        caption="Leaving the city before it wakes up is the single best part of a long ride."
        credit="Nathan Anderson · Unsplash"
        creditUrl="https://unsplash.com/photos/vPKW6jCs3Uk"
      />

      <h2 id="km-0-20">km 0–20 · the honeymoon</h2>
      <p>
        The first 20 kilometres of a long ride are a lie. Your legs are
        fresh. The roads are empty. The sunrise is doing Sunrise Things.
        You will look at your average speed and think you have gravely
        underestimated your capacity for endurance. Trust me — you have
        not. Ride easy here. Save it.
      </p>
      <p>
        I cruised at 26 km/h through Bhaktapur and out toward Sanga. Cool
        air. Very few motorbikes. Heart rate cooperating. I was pretty
        sure I had this one in the bag.
      </p>

      <h2 id="km-20-50">km 20–50 · the climb, and the first flat</h2>
      <p>
        Kathmandu's terrain does not do long flats. There is always a
        climb. Around km 32 I hit a gentle-but-unending grade out toward
        the eastern valley rim. HR crept up. Gears dropped. First bottle
        emptied faster than expected.
      </p>
      <p>
        Then — right at the top — a rear-tyre flat. Tiny thorn. I got off,
        swore quietly, and did the fastest tube-change of my life: 9
        minutes, most of which was spent not being able to remount the
        tyre because my hands were too cold.
      </p>

      <Callout kind="tip">
        <p>
          Change one practice tube at home, in the kitchen, with warm
          fingers. Your first flat on the road should not be the first
          time your hands have ever done this.
        </p>
      </Callout>

      <h3 id="refuel-1">First refuel</h3>
      <p>
        At km 48, a small tea-shop at a switchback. ₹60 got me lemon tea,
        two hard-boiled eggs, and a bench to sit on. Ten minutes. I ate
        slowly. This was the best decision of the day.
      </p>

      <h2 id="km-50-75">km 50–75 · the "why am I doing this" zone</h2>
      <p>
        This is where a century ride becomes psychological. The novelty is
        gone, the finish line is abstract, and every pedal stroke feels
        like it comes out of a fixed daily budget you're already
        overspending.
      </p>
      <p>
        I ran out of playlist at km 62. I do not recommend this. Bring
        more music than you think you need, and put the most embarrassing
        songs at the end. A Nepali 90s bhajan playlist, it turns out, is
        exactly the thing your legs want to hear at km 67. Who knew.
      </p>
      <p>
        I had my second flat at km 71 — pinch flat, my fault, I hit a
        pothole I was too tired to see. Out of spare tubes. Patched the
        hole by the roadside, rode gingerly at 18 km/h until I was sure
        the patch was holding.
      </p>

      <ArticleImage
        src="https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=1400&q=80&auto=format&fit=crop"
        alt="Snow-capped Himalayan peaks visible in the distance across a hazy green valley."
        width={1400}
        height={933}
        caption="Looking up at this, at km 74, made the legs temporarily stop complaining."
        credit="Daniel Leone · Unsplash"
        creditUrl="https://unsplash.com/photos/g30P1zcOzXo"
      />

      <h2 id="km-75-100">km 75–100 · the gear change in the head</h2>
      <p>
        Somewhere around km 80 the quality of the suffering changes. It
        stops being "I can't" and becomes "I just will". You stop
        calculating. You stop looking at the Garmin. You fall into a
        rhythm that is slow but unreasonably persistent. This is the part
        of long-distance riding that is worth the entire rest of the
        ride.
      </p>
      <p>
        I finished at km 101.3 at 12:47 PM — seven hours, 47 minutes
        elapsed, five hours, 58 minutes moving. [<a href="#ref-strava">1</a>]{' '}
        Average speed 17.1 km/h, which is slow by any club standard and
        fast by my own. The last two km were genuinely ceremonial — I
        rode past my usual tea shop on purpose, just to see if it still
        looked the same. It did.
      </p>

      <Callout kind="quote">
        <p>
          100 km is not a big number. It is a small number you have to
          say to yourself 30,000 times.
        </p>
      </Callout>

      <h2 id="lessons">Six lessons I would pass to last-year-me</h2>
      <ol>
        <li><strong>Eat before you're hungry, drink before you're thirsty.</strong> If you feel either, you're already behind. [<a href="#ref-fueling">2</a>]</li>
        <li><strong>Two tubes minimum.</strong> Always. Even for a 40 km loop. Flats come in pairs like misfortune.</li>
        <li><strong>Pace is a moral failing in the first hour.</strong> If you feel good at km 20, you are probably being stupid.</li>
        <li><strong>Playlists matter.</strong> Music is structural equipment, not entertainment, on a century.</li>
        <li><strong>The tea-shop is a training plan.</strong> Five 10-minute stops add 50 minutes to your finish time and 200% to your finish probability.</li>
        <li><strong>The post-ride shower is the best shower of the year.</strong> You cannot explain this to a non-cyclist. Don't try.</li>
      </ol>

      <h2 id="what-next">What next</h2>
      <p>
        More of them. Better paced, better fed, better slept. Eventually I
        want a 200&nbsp;km day, which a Strava friend tells me is 10x the
        suffering for 2x the distance, and I believe him, and I am still
        going to do it.
      </p>

      <hr />
      <p style={{ fontStyle: 'italic', opacity: 0.7 }}>
        Filed from the couch, one day later, with legs that work mostly
        downhill.
      </p>
    </>
  );
}
