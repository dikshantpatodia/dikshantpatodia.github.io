import { ArrowRight } from 'lucide-react'
import { profile, signals } from '@/data/content'
import { Reveal } from './ui/Reveal'

export function Hero() {
  return (
    <section className="hero wrap" id="top" aria-labelledby="hero-title">
      <div className="hero__grid">
        <Reveal>
          <div className="hero__kicker">
            <span className="hero__kicker-line" aria-hidden="true" />
            <span className="eyebrow">{profile.role}</span>
          </div>
          <h1 className="hero__display" id="hero-title">
            Good interfaces are <em>engineered</em>, not assembled.
          </h1>
          <p className="hero__lede">{profile.lede}</p>
          <div className="hero__actions">
            <a className="btn btn--solid" href="#work">
              Explore the work
              <ArrowRight aria-hidden="true" />
            </a>
            <a className="btn btn--line" href="#contact">
              Start a conversation
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <aside aria-label="Selected engineering signals">
            <span className="status">
              <span className="status__dot" aria-hidden="true" />
              {profile.location}
            </span>
            <ul className="signals">
              {signals.map((signal) => (
                <li className="signal" key={signal.label}>
                  <span className="signal__value">{signal.value}</span>
                  <span className="signal__label">{signal.label}</span>
                </li>
              ))}
            </ul>
            <p className="signals__note">Drawn from documented production work</p>
          </aside>
        </Reveal>
      </div>
    </section>
  )
}
