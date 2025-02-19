import Image from "next/image";
import { DevpostLink } from "../../components/devpost-link";

export default function Page() {
  return (
    <article className="max-w-none">
      <h1 className="text-4xl font-bold mb-8">TreeHacks 2025: HawkWatch</h1>
      <p className="text-2xl text-zinc-400 mb-12">1st Place Grand Prize ($11,000)</p>
      
      <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
        <Image
          src="/images/hawkwatch.png"
          alt="HawkWatch Project Overview"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="mb-12">
        <DevpostLink url="https://devpost.com/software/hawkwatch" />
      </div>

      <div className="space-y-8 text-lg leading-relaxed">
        <section>
          <p className="text-zinc-300">
            At Stanford&apos;s TreeHacks 2025, my team and I developed <b>HawkWatch</b> - an AI-powered 
            security camera monitoring system that won us the Grand Prize! This was my first-ever 
            hackathon experience and it was an absolutely incredible 36-hour experience. 
          </p>

          <p className="text-zinc-300 mt-4">
            HawkWatch is designed to enhance public safety by monitoring security camera feeds in real-time. 
            Using Google Gemini, TensorFlow, and Next.js, our system can automatically detect 
            and identify critical incidents such as shoplifting or assault, immediately alerting nearby 
            authorities when an incident is detected.
          </p>

          <p className="text-zinc-300 mt-4">
            I worked on HawkWatch together with Darryl Tanzil, Grace Shao, and Alex Li. We had randomly
            met on Slack a couple of days before the hackathon and had a great time working on HawkWatch together!
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-white">Tech</h2>
          <ul className="list-disc list-inside space-y-2 text-zinc-300">
            <li>Google&apos;s Gemini VLM to process security camera feeds and detect incidents</li>
            <li>TensorFlow for real-time computer vision</li>
            <li>Next.js for the web interface</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-white">TreeHacks</h2>
          <p className="text-zinc-300">
            TreeHacks is America&apos;s largest collegiate hackathon, bringing together 1,000 engineers from 
            over 30 countries.
          </p>
        </section>
      </div>
    </article>
  );
}
