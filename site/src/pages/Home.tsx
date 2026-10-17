import { Hero } from '@/components/Hero'
import { Work } from '@/components/Work'
import { Playground } from '@/components/Playground'
import { Leadership } from '@/components/Leadership'
import { Journal } from '@/components/Journal'
import { Contact } from '@/components/Contact'

/** The single-page home: hero, work, playground, leadership, journal, contact. */
export function Home() {
  return (
    <>
      <Hero />
      <Work />
      <Playground />
      <Leadership />
      <Journal />
      <Contact />
    </>
  )
}
