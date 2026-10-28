import { profile, socials } from '@/data/content'
import { CopyEmail } from './ui/CopyEmail'
import { Reveal } from './ui/Reveal'

export function Contact() {
  return (
    <section className="section wrap" id="contact" aria-labelledby="contact-title">
      <div className="contact__grid">
        <Reveal>
          <p className="eyebrow" style={{ marginBottom: '1.25rem' }}>
            05 — Contact
          </p>
          <h2 className="contact__display" id="contact-title">
            Let’s talk about the parts that are <em>hard to retrofit</em>.
          </h2>
          <CopyEmail email={profile.email} />
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="socials">
            {socials.map((social) => {
              const external = social.href.startsWith('http')
              return (
                <li key={social.label}>
                  <a
                    className="social"
                    href={social.href}
                    {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                  >
                    <span className="social__label">{social.label}</span>
                    <span className="social__handle">{social.handle}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
