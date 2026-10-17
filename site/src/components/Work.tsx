import { Plus } from 'lucide-react'
import { caseStudies } from '@/data/content'
import type { CaseStudy } from '@/data/types'
import { SectionHead } from './ui/SectionHead'
import { CaseMotif } from './ui/CaseMotif'

/**
 * Case studies are native <details> disclosures: the summary is the whole
 * clickable row, and the body opens without JavaScript. The open/close
 * transition is done in CSS with grid-template-rows.
 */
function CaseItem({ study }: { study: CaseStudy }) {
  return (
    <details className="case">
      <summary className="case__head">
        <span className="case__index" aria-hidden="true">
          {study.index}
        </span>
        <span className="case__headmain">
          <span className="case__kicker">{study.kicker}</span>
          <h3 className="case__title">{study.title}</h3>
          <span className="case__summary">{study.summary}</span>
        </span>
        <span className="case__toggle" aria-hidden="true">
          <Plus />
        </span>
      </summary>

      <div className="case__body">
        <div className="case__body-inner">
          <div className="case__body-grid">
            <div>
              <div className="case__block">
                <h4 className="case__block-title">The problem</h4>
                <p className="prose">{study.problem}</p>
              </div>
              <div className="case__block">
                <h4 className="case__block-title">Why it mattered</h4>
                <p className="prose">{study.mattered}</p>
              </div>
              <div className="case__block">
                <h4 className="case__block-title">What I did</h4>
                <ul className="case__list">
                  {study.contribution.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="case__block">
                <h4 className="case__block-title">Constraints &amp; trade-offs</h4>
                <ul className="case__list">
                  {study.constraints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="case__block">
                <h4 className="case__block-title">Approach</h4>
                <ul className="case__list">
                  {study.approach.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="case__demonstrates">{study.demonstrates}</p>
            </div>

            <aside>
              <div className="case__motif">
                <CaseMotif motif={study.motif} />
              </div>
              <div className="case__outcomes">
                {study.outcome.map((item) => (
                  <div className="case__outcome" key={item.label}>
                    <div className="case__outcome-value">{item.value}</div>
                    <div className="case__outcome-label">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="tags">
                {study.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </details>
  )
}

export function Work() {
  return (
    <section className="section wrap" id="work" aria-labelledby="work-title">
      <SectionHead
        index="01"
        label="Selected work"
        titleId="work-title"
        title={<>Four problems worth solving.</>}
        lede="Not a history of where I worked — a set of engineering problems and how I approached them. Each is drawn from documented production work."
      />
      <div>
        {caseStudies.map((study) => (
          <CaseItem key={study.id} study={study} />
        ))}
      </div>
      <p className="panel__note">
        Client work is described in the abstract. No confidential interfaces or internal metrics are
        reproduced.
      </p>
    </section>
  )
}
