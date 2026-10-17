import { pillars } from '@/data/content'
import { SectionHead } from './ui/SectionHead'
import { Reveal } from './ui/Reveal'

export function Leadership() {
  return (
    <section className="section wrap" id="leadership" aria-labelledby="leadership-title">
      <SectionHead
        index="03"
        label="Leadership"
        titleId="leadership-title"
        title={<>Leadership, without the timeline.</>}
        lede="No employer list and no date ranges. What matters is how an engineer helps a whole team make better decisions — the practices, and the documented work behind each one."
      />

      <Reveal>
        <div className="pillars">
          {pillars.map((pillar) => (
            <div className="pillar" key={pillar.id}>
              <h3 className="pillar__title">{pillar.title}</h3>
              <p className="pillar__body">{pillar.body}</p>
              <p className="pillar__evidence">{pillar.evidence}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <p className="panel__note">
        Evidence lines describe documented responsibilities. The framing is my own.
      </p>
    </section>
  )
}
